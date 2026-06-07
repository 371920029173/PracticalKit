export type DnsAnswer = { type: number; data: string; name?: string };

export type DnsLookupResult = {
  answers: string[];
  source: string;
};

type DnsResponse = { Status: number; Answer?: DnsAnswer[] };

const TYPE_CODE: Record<string, number> = {
  A: 1,
  AAAA: 28,
  MX: 15,
  TXT: 16,
  CNAME: 5,
  NS: 2,
};

async function fromCloudflare(name: string, typeCode: number): Promise<DnsLookupResult | null> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${typeCode}`,
      { headers: { Accept: "application/dns-json" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as DnsResponse;
    if (data.Status !== 0 || !data.Answer?.length) return null;
    return { answers: data.Answer.map((a) => a.data), source: "cloudflare-dns.com" };
  } catch {
    return null;
  }
}

async function fromGoogle(name: string, typeCode: number): Promise<DnsLookupResult | null> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${typeCode}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as DnsResponse;
    if (data.Status !== 0 || !data.Answer?.length) return null;
    return { answers: data.Answer.map((a) => a.data), source: "dns.google" };
  } catch {
    return null;
  }
}

export function dnsTypeCode(rtype: string): number {
  return TYPE_CODE[rtype] ?? 1;
}

export async function lookupDns(name: string, rtype: string): Promise<DnsLookupResult> {
  const clean = name.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!clean) throw new Error("empty");

  const typeCode = dnsTypeCode(rtype);

  for (const provider of [
    () => fromCloudflare(clean, typeCode),
    () => fromGoogle(clean, typeCode),
  ]) {
    const result = await provider();
    if (result) return result;
  }

  throw new Error("no_records");
}
