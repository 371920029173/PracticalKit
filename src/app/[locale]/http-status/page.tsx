"use client";

import { ToolPageShell } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

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

const MDN_LOCALE: Record<string, string> = {
  en: "en-US",
  zh: "zh-CN",
  ru: "ru",
  es: "es",
};

type StatusRow = { code: number; phrase: string };

export default function HttpStatusPage() {
  const t = useTranslations("httpStatusPage");
  const locale = useLocale();
  const [q, setQ] = useState("404");
  const [runQ, setRunQ] = useState("404");

  const mdnPrefix = MDN_LOCALE[locale] ?? "en-US";

  const matches = useMemo((): StatusRow[] => {
    const needle = runQ.trim().toLowerCase();
    const entries: StatusRow[] = Object.entries(STATUSES).map(([c, txt]) => ({
      code: Number(c),
      phrase: txt,
    }));
    if (!needle) {
      return entries.sort((a, b) => a.code - b.code);
    }
    return entries
      .filter((e) => String(e.code).includes(needle) || e.phrase.toLowerCase().includes(needle))
      .sort((a, b) => a.code - b.code);
  }, [runQ]);

  const detail = useMemo(() => {
    const c = Number(runQ.trim());
    if (!Number.isInteger(c)) return null;
    const phrase = STATUSES[c];
    return phrase ? { code: c, phrase } : null;
  }, [runQ]);

  const mdnHref = (code: number) =>
    `https://developer.mozilla.org/${mdnPrefix}/docs/Web/HTTP/Status/${code}`;

  function statusHint(code: number): string {
    switch (code) {
      case 400:
        return t("hint_400");
      case 401:
        return t("hint_401");
      case 403:
        return t("hint_403");
      case 404:
        return t("hint_404");
      case 405:
        return t("hint_405");
      case 408:
        return t("hint_408");
      case 409:
        return t("hint_409");
      case 413:
        return t("hint_413");
      case 415:
        return t("hint_415");
      case 422:
        return t("hint_422");
      case 429:
        return t("hint_429");
      case 500:
        return t("hint_500");
      case 502:
        return t("hint_502");
      case 503:
        return t("hint_503");
      case 504:
        return t("hint_504");
      default:
        return t("hint_default");
    }
  }

  function selectCode(code: number) {
    const s = String(code);
    setQ(s);
    setRunQ(s);
  }

  return (
    <ToolPageShell title={t("title")}>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <p className="tool-muted max-w-2xl">{t("privacyLine")}</p>
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
      <div className="flex flex-wrap gap-2">
        {["2", "3", "4", "5"].map((x) => (
          <button
            key={x}
            type="button"
            className="btn-ghost text-xs"
            onClick={() => {
              setQ(`${x}`);
              setRunQ(`${x}`);
            }}
          >
            {x}xx
          </button>
        ))}
      </div>
      {detail ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
            {t("detailTitle")}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold text-slate-900 dark:text-zinc-100">{detail.code}</p>
          <p className="mt-1 text-lg text-slate-800 dark:text-zinc-200">{detail.phrase}</p>
          <p className="mt-3">
            <a
              href={mdnHref(detail.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-indigo-600 underline-offset-2 hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {t("mdnLink")}
            </a>
          </p>
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">{t("hintTitle")}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">{statusHint(detail.code)}</p>
          </div>
        </div>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {t("resultsTitle")}
        </p>
        {matches.length === 0 ? (
          <p className="p-3 text-sm text-slate-500 dark:text-zinc-500">{t("notFound")}</p>
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-slate-100/95 text-xs text-slate-600 backdrop-blur dark:bg-zinc-900/95 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    {t("colCode")}
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    {t("colMeaning")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.map((row) => (
                  <tr
                    key={row.code}
                    className="border-t border-slate-200 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-800/80"
                  >
                    <td className="px-3 py-2 font-mono">
                      <button
                        type="button"
                        className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
                        onClick={() => selectCode(row.code)}
                      >
                        {row.code}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-slate-800 dark:text-zinc-200">{row.phrase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
}
