export type ExchangeRates = {
  base: string;
  rates: Record<string, number>;
  source: string;
};

async function fromErApi(base: string): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      result?: string;
      base_code?: string;
      rates?: Record<string, number>;
    };
    if (j.result !== "success" || !j.rates) return null;
    return { base: j.base_code ?? base, rates: j.rates, source: "open.er-api.com" };
  } catch {
    return null;
  }
}

async function fromFrankfurter(base: string): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as { base?: string; rates?: Record<string, number> };
    if (!j.rates) return null;
    return { base: j.base ?? base, rates: j.rates, source: "frankfurter.app" };
  } catch {
    return null;
  }
}

export async function fetchExchangeRates(base: string): Promise<ExchangeRates> {
  const code = (base.trim() || "USD").toUpperCase();
  for (const provider of [() => fromErApi(code), () => fromFrankfurter(code)]) {
    const result = await provider();
    if (result) return result;
  }
  throw new Error("exchange_unavailable");
}
