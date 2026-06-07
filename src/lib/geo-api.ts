export type IpGeoResult = {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  isp?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  source: string;
};

const GEO_CACHE_KEY = "pk-ipgeo-v2";
const GEO_CACHE_MS = 30 * 60 * 1000;

type Cached = IpGeoResult & { ts: number };

function readCache(): IpGeoResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (!parsed.ip || Date.now() - parsed.ts > GEO_CACHE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(result: IpGeoResult) {
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ ...result, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fromGeoJs(): Promise<IpGeoResult | null> {
  const data = await fetchJson<{
    ip?: string;
    city?: string;
    region?: string;
    country?: string;
    country_code?: string;
    organization?: string;
    timezone?: string;
    latitude?: string;
    longitude?: string;
  }>("https://get.geojs.io/v1/ip/geo.json");
  if (!data?.ip) return null;
  return {
    ip: data.ip,
    city: data.city,
    region: data.region,
    country: data.country,
    country_code: data.country_code?.toUpperCase(),
    isp: data.organization,
    timezone: data.timezone,
    latitude: data.latitude ? Number(data.latitude) : undefined,
    longitude: data.longitude ? Number(data.longitude) : undefined,
    source: "geojs.io",
  };
}

async function fromFreeIpApi(): Promise<IpGeoResult | null> {
  const data = await fetchJson<{
    ipAddress?: string;
    cityName?: string;
    regionName?: string;
    countryName?: string;
    countryCode?: string;
    timeZone?: string;
    latitude?: number;
    longitude?: number;
  }>("https://freeipapi.com/api/json");
  if (!data?.ipAddress) return null;
  return {
    ip: data.ipAddress,
    city: data.cityName,
    region: data.regionName,
    country: data.countryName,
    country_code: data.countryCode?.toUpperCase(),
    timezone: data.timeZone,
    latitude: data.latitude,
    longitude: data.longitude,
    source: "freeipapi.com",
  };
}

async function fromIpWho(): Promise<IpGeoResult | null> {
  const data = await fetchJson<{
    success?: boolean;
    ip?: string;
    city?: string;
    region?: string;
    country?: string;
    country_code?: string;
    connection?: { isp?: string };
    timezone?: { id?: string };
    latitude?: number;
    longitude?: number;
    message?: string;
  }>("https://ipwho.is/");
  if (data?.success === false || !data?.ip) return null;
  return {
    ip: data.ip,
    city: data.city,
    region: data.region,
    country: data.country,
    country_code: data.country_code?.toUpperCase(),
    isp: data.connection?.isp,
    timezone: typeof data.timezone === "object" ? data.timezone?.id : undefined,
    latitude: data.latitude,
    longitude: data.longitude,
    source: "ipwho.is",
  };
}

async function fromCfTrace(): Promise<IpGeoResult | null> {
  try {
    const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    const map = Object.fromEntries(
      text
        .trim()
        .split("\n")
        .map((line) => {
          const i = line.indexOf("=");
          return i > 0 ? [line.slice(0, i), line.slice(i + 1)] : null;
        })
        .filter(Boolean) as [string, string][],
    );
    if (!map.ip) return null;
    return {
      ip: map.ip,
      country_code: map.loc?.toUpperCase(),
      timezone: map.tz,
      source: "cloudflare.com",
    };
  } catch {
    return null;
  }
}

const PROVIDERS = [fromGeoJs, fromFreeIpApi, fromIpWho, fromCfTrace] as const;

/** Try multiple geo providers; returns first success or throws. */
export async function fetchIpGeo(options?: { useCache?: boolean }): Promise<IpGeoResult> {
  if (options?.useCache !== false) {
    const cached = readCache();
    if (cached) return cached;
  }

  for (const provider of PROVIDERS) {
    const result = await provider();
    if (result?.ip) {
      writeCache(result);
      return result;
    }
  }

  throw new Error("all_providers_failed");
}

/** Country code only — lighter cache shared with regional flair. */
export async function fetchCountryCode(): Promise<string | null> {
  try {
    const geo = await fetchIpGeo();
    return geo.country_code ?? null;
  } catch {
    return null;
  }
}
