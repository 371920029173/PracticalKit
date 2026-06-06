"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

type DnsAnswer = { type: number; data: string; name?: string };
type DnsResponse = { Status: number; Answer?: DnsAnswer[] };

const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "CNAME", "NS"] as const;
const TYPE_CODE: Record<(typeof RECORD_TYPES)[number], number> = {
  A: 1,
  AAAA: 28,
  MX: 15,
  TXT: 16,
  CNAME: 5,
  NS: 2,
};

export default function DnsLookupPage() {
  const t = useTranslations("dnsLookupPage");
  const tc = useTranslations("common");
  const [domain, setDomain] = useState("");
  const [rtype, setRtype] = useState<(typeof RECORD_TYPES)[number]>("A");
  const [answers, setAnswers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const lookup = useCallback(async () => {
    const name = domain.trim().replace(/^https?:\/\//, "").split("/")[0];
    if (!name) {
      setErr(t("empty"));
      return;
    }
    setBusy(true);
    setErr("");
    setAnswers([]);
    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${TYPE_CODE[rtype]}`,
        { headers: { Accept: "application/dns-json" } },
      );
      if (!res.ok) throw new Error("http");
      const data = (await res.json()) as DnsResponse;
      if (data.Status !== 0 || !data.Answer?.length) {
        setErr(t("noRecords"));
        return;
      }
      setAnswers(data.Answer.map((a) => a.data));
    } catch {
      setErr(t("error"));
    } finally {
      setBusy(false);
    }
  }, [domain, rtype, t]);

  const resetAndRun = useCallback(async () => {
    setDomain(t("sample"));
    setRtype("A");
    setBusy(true);
    setErr("");
    setAnswers([]);
    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(t("sample"))}&type=1`,
        { headers: { Accept: "application/dns-json" } },
      );
      const data = (await res.json()) as DnsResponse;
      setAnswers(data.Answer?.map((a) => a.data) ?? []);
    } catch {
      setErr(t("error"));
    } finally {
      setBusy(false);
    }
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex flex-wrap gap-3">
        <input
          className="tool-field min-w-[12rem] flex-1 font-mono"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={t("placeholder")}
          spellCheck={false}
        />
        <select className="tool-select w-auto" value={rtype} onChange={(e) => setRtype(e.target.value as typeof rtype)}>
          {RECORD_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <ToolRunActions onRun={lookup} onResetAndRun={resetAndRun} busy={busy} />
        {answers.length ? (
          <button type="button" className="btn-ghost text-sm" onClick={() => void navigator.clipboard.writeText(answers.join("\n"))}>
            {tc("copy")}
          </button>
        ) : null}
      </div>
      {err ? <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
      {answers.length ? (
        <ul className="tool-pre-out space-y-1">
          {answers.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : busy ? (
        <div className="loader-row py-6">
          <span className="loader-dot" />
          <span className="loader-dot" style={{ animationDelay: "120ms" }} />
          <span className="loader-dot" style={{ animationDelay: "240ms" }} />
        </div>
      ) : null}
      <p className="text-xs text-slate-500 dark:text-zinc-500">{t("provider")}</p>
    </div>
  );
}
