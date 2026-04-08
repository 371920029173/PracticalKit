"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function MoneyPage() {
  const t = useTranslations("money");
  const [base, setBase] = useState("USD");
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`
      );
      const j = (await res.json()) as {
        result?: string;
        rates?: Record<string, number>;
      };
      if (j.result !== "success" || !j.rates) throw new Error("bad response");
      setData(j.rates);
    } catch (e) {
      setErr(String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const sample = data
    ? Object.entries(data)
        .filter(([k]) => ["EUR", "GBP", "JPY", "CNY", "RUB"].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="text-zinc-500">{t("base")}</span>
          <input
            className="mt-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-2 font-mono uppercase"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={refresh}
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900"
        >
          {t("refresh")}
        </button>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <pre className="max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-black/40 p-3 text-xs text-zinc-300">
        {sample || "—"}
      </pre>
    </div>
  );
}
