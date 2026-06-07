"use client";

import { ToolPageShell, ToolSection, ToolOutput } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { translateText } from "@/lib/translate-api";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const DEF_Q = "Hello";
const DEF_FROM = "en";
const DEF_TO = "zh";

export default function TranslatePage() {
  const t = useTranslations("translate");
  const tc = useTranslations("common");
  const [q, setQ] = useState(DEF_Q);
  const [from, setFrom] = useState(DEF_FROM);
  const [to, setTo] = useState(DEF_TO);
  const [out, setOut] = useState("");
  const [source, setSource] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setOut("");
    setErr("");
    setSource("");
    try {
      const result = await translateText(q, from, to);
      setOut(result.text);
      setSource(result.source);
    } catch {
      setErr(t("error"));
    } finally {
      setLoading(false);
    }
  }, [q, from, to, t]);

  const resetAndRun = useCallback(async () => {
    setQ(DEF_Q);
    setFrom(DEF_FROM);
    setTo(DEF_TO);
    setOut("");
    setErr("");
    setSource("");
    setLoading(true);
    try {
      const result = await translateText(DEF_Q, DEF_FROM, DEF_TO);
      setOut(result.text);
      setSource(result.source);
    } catch {
      setErr(t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
          {t("disclaimer")}
        </p>
      </ToolSection>
      <ToolSection title={t("inputTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="tool-muted">{t("from")}</span>
            <input
              className="tool-field mt-1 w-full font-mono uppercase"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              spellCheck={false}
            />
          </label>
          <label className="text-sm">
            <span className="tool-muted">{t("to")}</span>
            <input
              className="tool-field mt-1 w-full font-mono uppercase"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              spellCheck={false}
            />
          </label>
        </div>
        <textarea
          className="tool-textarea mt-3 min-h-32"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={loading} />
          {out ? (
            <button type="button" className="btn-ghost text-sm" onClick={() => void navigator.clipboard.writeText(out)}>
              {tc("copy")}
            </button>
          ) : null}
        </div>
        {err ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
      </ToolSection>
      <ToolSection title={t("outputTitle")}>
        <ToolOutput mono>{out || "—"}</ToolOutput>
        {source ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-zinc-500">{t("provider", { source })}</p>
        ) : null}
      </ToolSection>
    </ToolPageShell>
  );
}
