"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

type Parsed = Record<string, string>;

function parseUrl(raw: string): Parsed | null {
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const params: string[] = [];
    u.searchParams.forEach((v, k) => params.push(`${k}=${v}`));
    return {
      href: u.href,
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || "(default)",
      pathname: u.pathname || "/",
      search: u.search || "—",
      hash: u.hash || "—",
      origin: u.origin,
      params: params.length ? params.join("\n") : "—",
    };
  } catch {
    return null;
  }
}

export default function UrlParserPage() {
  const t = useTranslations("urlParserPage");
  const tc = useTranslations("common");
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [err, setErr] = useState(false);

  const run = useCallback(() => {
    const result = parseUrl(input.trim());
    setParsed(result);
    setErr(!result);
  }, [input]);

  const resetAndRun = useCallback(() => {
    const sample = t("sample");
    setInput(sample);
    setParsed(parseUrl(sample));
    setErr(false);
  }, [t]);

  const fields = ["href", "origin", "protocol", "hostname", "port", "pathname", "search", "hash", "params"] as const;

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <input
        className="tool-field w-full font-mono"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("placeholder")}
        spellCheck={false}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
      {err ? <p className="text-sm text-rose-600 dark:text-rose-400">{t("invalid")}</p> : null}
      {parsed ? (
        <dl className="glass-panel grid gap-3 rounded-2xl p-5 sm:grid-cols-2">
          {fields.map((key) => (
            <div key={key} className={key === "params" ? "sm:col-span-2" : undefined}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t(key)}</dt>
              <dd className="mt-1 break-all font-mono text-sm text-slate-900 dark:text-zinc-100">{parsed[key]}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {parsed ? (
        <button type="button" className="btn-ghost text-sm" onClick={() => void navigator.clipboard.writeText(JSON.stringify(parsed, null, 2))}>
          {tc("copy")}
        </button>
      ) : null}
    </div>
  );
}
