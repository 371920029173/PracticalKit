"use client";

import { ToolPageShell, ToolSection, ToolOutput } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { fetchExchangeRates } from "@/lib/exchange-api";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const SAMPLE = ["EUR", "GBP", "JPY", "CNY", "RUB", "CAD", "AUD", "CHF"];

export default function MoneyPage() {
  const t = useTranslations("money");
  const [base, setBase] = useState("USD");
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [source, setSource] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await fetchExchangeRates(base);
      setData(result.rates);
      setSource(result.source);
    } catch {
      setErr(t("error"));
      setData(null);
      setSource("");
    } finally {
      setLoading(false);
    }
  }, [base, t]);

  const resetAndRun = useCallback(async () => {
    setBase("USD");
    setErr("");
    setData(null);
    setSource("");
    setLoading(true);
    try {
      const result = await fetchExchangeRates("USD");
      setData(result.rates);
      setSource(result.source);
    } catch {
      setErr(t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const sample = useMemo(() => {
    if (!data) return "";
    return SAMPLE.filter((k) => data[k] != null)
      .map((k) => `${k}: ${data[k]}`)
      .join("\n");
  }, [data]);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection title={t("inputTitle")} description={t("inputNote")}>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="tool-muted">{t("base")}</span>
            <input
              className="tool-field mt-1 font-mono uppercase"
              value={base}
              onChange={(e) => setBase(e.target.value.toUpperCase())}
              spellCheck={false}
            />
          </label>
          <ToolRunActions onRun={refresh} onResetAndRun={resetAndRun} busy={loading} />
        </div>
        {err ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
      </ToolSection>
      <ToolSection title={t("outputTitle")}>
        <ToolOutput mono>{sample || "—"}</ToolOutput>
        {source ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-zinc-500">{t("provider", { source })}</p>
        ) : null}
      </ToolSection>
    </ToolPageShell>
  );
}
