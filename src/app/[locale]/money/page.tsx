"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export default function MoneyPage() {
  const t = useTranslations("money");
  const [base, setBase] = useState("USD");
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `https://open.er-api.com/v6/latest/${encodeURIComponent(base.trim() || "USD")}`
      );
      const j = (await res.json()) as {
        result?: string;
        rates?: Record<string, number>;
        "error-type"?: string;
      };
      if (j.result !== "success" || !j.rates) {
        throw new Error(j["error-type"] || j.result || "bad response");
      }
      setData(j.rates);
    } catch (e) {
      setErr(String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [base]);

  const resetAndRun = useCallback(async () => {
    setBase("USD");
    setErr("");
    setData(null);
    setLoading(true);
    try {
      const res = await fetch(
        "https://open.er-api.com/v6/latest/USD"
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
  }, []);

  const sample = data
    ? Object.entries(data)
        .filter(([k]) => ["EUR", "GBP", "JPY", "CNY", "RUB"].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="tool-muted">{t("base")}</span>
          <input
            className="tool-field mt-1 font-mono uppercase"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
        </label>
        <ToolRunActions
          onRun={refresh}
          onResetAndRun={resetAndRun}
          busy={loading}
        />
      </div>
      {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
      <pre className="tool-pre max-h-80 text-xs">{sample || "—"}</pre>
    </div>
  );
}
