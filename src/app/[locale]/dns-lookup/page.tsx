"use client";

import { ToolPageShell, ToolSection, ToolOutput } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { lookupDns } from "@/lib/dns-api";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "CNAME", "NS"] as const;

export default function DnsLookupPage() {
  const t = useTranslations("dnsLookupPage");
  const tc = useTranslations("common");
  const [domain, setDomain] = useState("");
  const [rtype, setRtype] = useState<(typeof RECORD_TYPES)[number]>("A");
  const [answers, setAnswers] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const lookup = useCallback(async () => {
    setBusy(true);
    setErr("");
    setAnswers([]);
    setSource("");
    try {
      const result = await lookupDns(domain, rtype);
      setAnswers(result.answers);
      setSource(result.source);
    } catch (e) {
      setErr(e instanceof Error && e.message === "empty" ? t("empty") : t("error"));
    } finally {
      setBusy(false);
    }
  }, [domain, rtype, t]);

  const resetAndRun = useCallback(async () => {
    const sample = t("sample");
    setDomain(sample);
    setRtype("A");
    setBusy(true);
    setErr("");
    setAnswers([]);
    setSource("");
    try {
      const result = await lookupDns(sample, "A");
      setAnswers(result.answers);
      setSource(result.source);
    } catch {
      setErr(t("error"));
    } finally {
      setBusy(false);
    }
  }, [t]);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection title={t("inputTitle")}>
        <div className="flex flex-wrap gap-3">
          <input
            className="tool-field min-w-[12rem] flex-1 font-mono"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder={t("placeholder")}
            spellCheck={false}
          />
          <select
            className="tool-select w-auto"
            value={rtype}
            onChange={(e) => setRtype(e.target.value as typeof rtype)}
          >
            {RECORD_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ToolRunActions onRun={lookup} onResetAndRun={resetAndRun} busy={busy} />
          {answers.length ? (
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={() => void navigator.clipboard.writeText(answers.join("\n"))}
            >
              {tc("copy")}
            </button>
          ) : null}
        </div>
        {err ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
      </ToolSection>
      <ToolSection title={t("outputTitle")}>
        {answers.length ? (
          <>
            <ToolOutput mono>
              <ul className="space-y-1">
                {answers.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </ToolOutput>
            {source ? (
              <p className="mt-3 text-xs text-slate-500 dark:text-zinc-500">{t("provider", { source })}</p>
            ) : null}
          </>
        ) : busy ? (
          <div className="loader-row py-6">
            <span className="loader-dot" />
            <span className="loader-dot" style={{ animationDelay: "120ms" }} />
            <span className="loader-dot" style={{ animationDelay: "240ms" }} />
          </div>
        ) : (
          <ToolOutput mono>—</ToolOutput>
        )}
      </ToolSection>
    </ToolPageShell>
  );
}
