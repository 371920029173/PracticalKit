"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function TranslatePage() {
  const t = useTranslations("translate");
  const [q, setQ] = useState("Hello");
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("zh");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setOut("");
    try {
      const u = new URL("https://api.mymemory.translated.net/get");
      u.searchParams.set("q", q);
      u.searchParams.set("langpair", `${from}|${to}`);
      const res = await fetch(u.toString());
      const data = (await res.json()) as {
        responseData?: { translatedText?: string };
        responseStatus?: number;
      };
      setOut(data.responseData?.translatedText || JSON.stringify(data));
    } catch (e) {
      setOut(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <p className="text-sm text-amber-200/80">{t("disclaimer")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-zinc-500">{t("from")}</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 font-mono uppercase"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-zinc-500">{t("to")}</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 font-mono uppercase"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <textarea
        className="min-h-32 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        type="button"
        disabled={loading}
        onClick={run}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "…" : "Translate"}
      </button>
      <pre className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-black/40 p-3 text-sm text-zinc-200">
        {out || "—"}
      </pre>
    </div>
  );
}
