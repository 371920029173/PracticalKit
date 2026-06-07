export type TranslateResult = {
  text: string;
  source: string;
};

async function fromMyMemory(q: string, from: string, to: string): Promise<TranslateResult | null> {
  try {
    const u = new URL("https://api.mymemory.translated.net/get");
    u.searchParams.set("q", q);
    u.searchParams.set("langpair", `${from}|${to}`);
    const res = await fetch(u.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      responseStatus?: number;
      responseData?: { translatedText?: string };
    };
    const text = data.responseData?.translatedText?.trim();
    if (!text || data.responseStatus !== 200) return null;
    if (/^MYMEMORY WARNING/i.test(text)) return null;
    return { text, source: "mymemory.translated.net" };
  } catch {
    return null;
  }
}

async function fromLibreTranslate(q: string, from: string, to: string): Promise<TranslateResult | null> {
  const endpoints = [
    "https://libretranslate.de/translate",
    "https://translate.argosopentech.com/translate",
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, source: from, target: to, format: "text" }),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { translatedText?: string };
      const text = data.translatedText?.trim();
      if (text) return { text, source: new URL(url).hostname };
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function translateText(q: string, from: string, to: string): Promise<TranslateResult> {
  const text = q.trim();
  if (!text) throw new Error("empty");
  const src = from.trim().toLowerCase();
  const tgt = to.trim().toLowerCase();

  for (const provider of [
    () => fromMyMemory(text, src, tgt),
    () => fromLibreTranslate(text, src, tgt),
  ]) {
    const result = await provider();
    if (result) return result;
  }

  throw new Error("translate_unavailable");
}
