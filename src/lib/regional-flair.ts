export type FlairId = "ca" | "us" | "cn" | "tw" | "fr" | "es" | "ru" | "gb" | "au" | "jp" | "kr";

export type Daypart = "day" | "night";

export type FlairPalette = {
  meshA: string;
  meshB: string;
  meshC: string;
  accent: string;
  accentSoft: string;
};

export type FlairDef = {
  id: FlairId;
  countries?: string[];
  locales?: string[];
  badge: string;
  decoration: "maple" | "stars" | "lantern" | "blossom" | "tricolor" | "sunset" | "aurora" | "mist" | "outback" | "sakura" | "hangul";
};

export const FLAIR_DEFS: FlairDef[] = [
  { id: "ca", countries: ["CA"], locales: ["en", "fr"], badge: "🍁", decoration: "maple" },
  { id: "us", countries: ["US"], locales: ["en"], badge: "★", decoration: "stars" },
  { id: "cn", countries: ["CN"], locales: ["zh"], badge: "灯", decoration: "lantern" },
  { id: "tw", countries: ["TW", "HK", "MO", "SG"], locales: ["zh"], badge: "🌸", decoration: "blossom" },
  { id: "fr", countries: ["FR", "BE", "CH", "LU", "MC"], locales: ["fr"], badge: "🇫🇷", decoration: "tricolor" },
  { id: "es", countries: ["ES", "MX", "AR", "CO", "CL", "PE", "VE"], locales: ["es"], badge: "☀", decoration: "sunset" },
  { id: "ru", countries: ["RU", "BY", "KZ"], locales: ["ru"], badge: "❄", decoration: "aurora" },
  { id: "gb", countries: ["GB", "IE"], locales: ["en"], badge: "🫖", decoration: "mist" },
  { id: "au", countries: ["AU", "NZ"], locales: ["en"], badge: "🌿", decoration: "outback" },
  { id: "jp", countries: ["JP"], badge: "🌸", decoration: "sakura" },
  { id: "kr", countries: ["KR"], badge: "◈", decoration: "hangul" },
];

/** Locale-only fallbacks when country is unknown or unmatched. */
const LOCALE_FALLBACK: Partial<Record<string, FlairId>> = {
  zh: "cn",
  fr: "fr",
  es: "es",
  ru: "ru",
};

export const FLAIR_PALETTES: Record<FlairId, Record<Daypart, FlairPalette>> = {
  ca: {
    day: {
      meshA: "rgba(220, 38, 38, 0.09)",
      meshB: "rgba(255, 255, 255, 0.35)",
      meshC: "rgba(234, 88, 12, 0.07)",
      accent: "#dc2626",
      accentSoft: "rgba(220, 38, 38, 0.12)",
    },
    night: {
      meshA: "rgba(220, 38, 38, 0.06)",
      meshB: "rgba(56, 189, 248, 0.05)",
      meshC: "rgba(251, 191, 36, 0.04)",
      accent: "#f87171",
      accentSoft: "rgba(248, 113, 113, 0.12)",
    },
  },
  us: {
    day: {
      meshA: "rgba(37, 99, 235, 0.08)",
      meshB: "rgba(220, 38, 38, 0.06)",
      meshC: "rgba(255, 255, 255, 0.4)",
      accent: "#2563eb",
      accentSoft: "rgba(37, 99, 235, 0.12)",
    },
    night: {
      meshA: "rgba(30, 58, 138, 0.12)",
      meshB: "rgba(220, 38, 38, 0.05)",
      meshC: "rgba(147, 197, 253, 0.04)",
      accent: "#93c5fd",
      accentSoft: "rgba(147, 197, 253, 0.1)",
    },
  },
  cn: {
    day: {
      meshA: "rgba(220, 38, 38, 0.08)",
      meshB: "rgba(234, 179, 8, 0.1)",
      meshC: "rgba(254, 226, 226, 0.5)",
      accent: "#b91c1c",
      accentSoft: "rgba(185, 28, 28, 0.12)",
    },
    night: {
      meshA: "rgba(127, 29, 29, 0.15)",
      meshB: "rgba(234, 179, 8, 0.06)",
      meshC: "rgba(251, 191, 36, 0.03)",
      accent: "#fca5a5",
      accentSoft: "rgba(252, 165, 165, 0.1)",
    },
  },
  tw: {
    day: {
      meshA: "rgba(244, 114, 182, 0.1)",
      meshB: "rgba(255, 255, 255, 0.35)",
      meshC: "rgba(16, 185, 129, 0.06)",
      accent: "#db2777",
      accentSoft: "rgba(219, 39, 119, 0.1)",
    },
    night: {
      meshA: "rgba(190, 24, 93, 0.08)",
      meshB: "rgba(129, 140, 248, 0.06)",
      meshC: "rgba(52, 211, 153, 0.04)",
      accent: "#f9a8d4",
      accentSoft: "rgba(249, 168, 212, 0.1)",
    },
  },
  fr: {
    day: {
      meshA: "rgba(37, 99, 235, 0.07)",
      meshB: "rgba(255, 255, 255, 0.45)",
      meshC: "rgba(220, 38, 38, 0.06)",
      accent: "#1d4ed8",
      accentSoft: "rgba(29, 78, 216, 0.1)",
    },
    night: {
      meshA: "rgba(30, 64, 175, 0.1)",
      meshB: "rgba(255, 255, 255, 0.04)",
      meshC: "rgba(185, 28, 28, 0.06)",
      accent: "#93c5fd",
      accentSoft: "rgba(147, 197, 253, 0.1)",
    },
  },
  es: {
    day: {
      meshA: "rgba(234, 88, 12, 0.1)",
      meshB: "rgba(250, 204, 21, 0.08)",
      meshC: "rgba(220, 38, 38, 0.05)",
      accent: "#ea580c",
      accentSoft: "rgba(234, 88, 12, 0.12)",
    },
    night: {
      meshA: "rgba(124, 45, 18, 0.12)",
      meshB: "rgba(234, 179, 8, 0.05)",
      meshC: "rgba(220, 38, 38, 0.04)",
      accent: "#fdba74",
      accentSoft: "rgba(253, 186, 116, 0.1)",
    },
  },
  ru: {
    day: {
      meshA: "rgba(37, 99, 235, 0.08)",
      meshB: "rgba(255, 255, 255, 0.4)",
      meshC: "rgba(220, 38, 38, 0.07)",
      accent: "#1e40af",
      accentSoft: "rgba(30, 64, 175, 0.1)",
    },
    night: {
      meshA: "rgba(56, 189, 248, 0.07)",
      meshB: "rgba(129, 140, 248, 0.08)",
      meshC: "rgba(220, 38, 38, 0.05)",
      accent: "#7dd3fc",
      accentSoft: "rgba(125, 211, 252, 0.1)",
    },
  },
  gb: {
    day: {
      meshA: "rgba(29, 78, 216, 0.07)",
      meshB: "rgba(255, 255, 255, 0.4)",
      meshC: "rgba(220, 38, 38, 0.05)",
      accent: "#1e3a8a",
      accentSoft: "rgba(30, 58, 138, 0.1)",
    },
    night: {
      meshA: "rgba(51, 65, 85, 0.15)",
      meshB: "rgba(148, 163, 184, 0.06)",
      meshC: "rgba(220, 38, 38, 0.04)",
      accent: "#94a3b8",
      accentSoft: "rgba(148, 163, 184, 0.1)",
    },
  },
  au: {
    day: {
      meshA: "rgba(22, 163, 74, 0.08)",
      meshB: "rgba(250, 204, 21, 0.08)",
      meshC: "rgba(14, 165, 233, 0.06)",
      accent: "#15803d",
      accentSoft: "rgba(21, 128, 61, 0.1)",
    },
    night: {
      meshA: "rgba(6, 78, 59, 0.12)",
      meshB: "rgba(250, 204, 21, 0.04)",
      meshC: "rgba(56, 189, 248, 0.05)",
      accent: "#86efac",
      accentSoft: "rgba(134, 239, 172, 0.1)",
    },
  },
  jp: {
    day: {
      meshA: "rgba(244, 114, 182, 0.09)",
      meshB: "rgba(255, 255, 255, 0.35)",
      meshC: "rgba(220, 38, 38, 0.04)",
      accent: "#be185d",
      accentSoft: "rgba(190, 24, 93, 0.1)",
    },
    night: {
      meshA: "rgba(88, 28, 135, 0.1)",
      meshB: "rgba(251, 191, 36, 0.04)",
      meshC: "rgba(244, 114, 182, 0.05)",
      accent: "#f9a8d4",
      accentSoft: "rgba(249, 168, 212, 0.1)",
    },
  },
  kr: {
    day: {
      meshA: "rgba(37, 99, 235, 0.07)",
      meshB: "rgba(255, 255, 255, 0.4)",
      meshC: "rgba(220, 38, 38, 0.06)",
      accent: "#1d4ed8",
      accentSoft: "rgba(29, 78, 216, 0.1)",
    },
    night: {
      meshA: "rgba(30, 58, 138, 0.1)",
      meshB: "rgba(220, 38, 38, 0.05)",
      meshC: "rgba(147, 197, 253, 0.04)",
      accent: "#93c5fd",
      accentSoft: "rgba(147, 197, 253, 0.1)",
    },
  },
};

const GEO_CACHE_KEY = "pk-geo-v1";

export type GeoSnapshot = {
  countryCode: string;
  country?: string;
  ts: number;
};

export function readCachedGeo(): GeoSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoSnapshot;
    if (!parsed.countryCode || Date.now() - parsed.ts > 6 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedGeo(geo: GeoSnapshot) {
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
  } catch {
    /* ignore */
  }
}

export function resolveFlair(countryCode: string | null, locale: string): FlairDef | null {
  const cc = countryCode?.toUpperCase() ?? null;

  if (cc) {
    const countryFirst = FLAIR_DEFS.filter((d) => d.countries?.includes(cc));
    if (countryFirst.length) {
      const withLocale = countryFirst.find((d) => !d.locales || d.locales.includes(locale));
      if (withLocale) return withLocale;
      return countryFirst[0] ?? null;
    }
  }

  const localeOnly = FLAIR_DEFS.find((d) => d.locales?.includes(locale) && !d.countries);
  if (localeOnly) return localeOnly;

  const fallbackId = LOCALE_FALLBACK[locale];
  if (fallbackId) return FLAIR_DEFS.find((d) => d.id === fallbackId) ?? null;

  return null;
}

export function applyFlairToDocument(flair: FlairDef | null, daypart: Daypart) {
  const root = document.documentElement;
  if (!flair) {
    delete root.dataset.flair;
    delete root.dataset.flairDecoration;
    for (const key of [
      "--flair-mesh-a",
      "--flair-mesh-b",
      "--flair-mesh-c",
      "--flair-accent",
      "--flair-accent-soft",
      "--mesh-a",
      "--mesh-b",
      "--mesh-c",
      "--accent",
      "--accent-soft",
    ]) {
      root.style.removeProperty(key);
    }
    return;
  }

  const palette = FLAIR_PALETTES[flair.id][daypart];
  root.dataset.flair = flair.id;
  root.dataset.flairDecoration = flair.decoration;
  root.dataset.daypart = daypart;
  root.style.setProperty("--flair-mesh-a", palette.meshA);
  root.style.setProperty("--flair-mesh-b", palette.meshB);
  root.style.setProperty("--flair-mesh-c", palette.meshC);
  root.style.setProperty("--flair-accent", palette.accent);
  root.style.setProperty("--flair-accent-soft", palette.accentSoft);
  root.style.setProperty("--mesh-a", palette.meshA);
  root.style.setProperty("--mesh-b", palette.meshB);
  root.style.setProperty("--mesh-c", palette.meshC);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-soft", palette.accentSoft);
}
