"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const STATUSES: Record<number, string> = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  413: "Payload Too Large",
  415: "Unsupported Media Type",
  418: "I'm a teapot",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export default function HttpStatusPage() {
  const t = useTranslations("httpStatusPage");
  const [q, setQ] = useState("404");
  const [runQ, setRunQ] = useState("404");

  const matches = useMemo(() => {
    const needle = runQ.trim().toLowerCase();
    if (!needle) return [];
    return Object.entries(STATUSES)
      .filter(([c, txt]) => c.includes(needle) || txt.toLowerCase().includes(needle))
      .map(([c, txt]) => `${c} ${txt}`);
  }, [runQ]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
          placeholder={t("input")}
        />
        <ToolRunActions
          onRun={() => setRunQ(q)}
          onResetAndRun={() => {
            setQ("404");
            setRunQ("404");
          }}
        />
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
        {matches.length === 0 ? (
          <p className="text-sm text-slate-500">{t("notFound")}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {matches.map((m) => (
              <li key={m}>
                <code>{m}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
