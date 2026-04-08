"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function parseHeaders(text: string): Record<string, string> {
  const h: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (k) h[k] = v;
  }
  return h;
}

export default function ApiSnippetPage() {
  const t = useTranslations("apiSnippetPage");
  const [url, setUrl] = useState("https://api.example.com/items");
  const [method, setMethod] = useState("GET");
  const [headersText, setHeadersText] = useState("Content-Type: application/json");
  const [body, setBody] = useState('{\n  "name": "item"\n}');
  const [curl, setCurl] = useState("");
  const [fetchCode, setFetchCode] = useState("");

  function run() {
    const headers = parseHeaders(headersText);
    const headerArgs = Object.entries(headers)
      .map(([k, v]) => `-H "${k}: ${v.replace(/"/g, '\\"')}"`)
      .join(" ");
    const bodyArg =
      method === "GET" || !body.trim() ? "" : ` -d '${body.replace(/'/g, "'\"'\"'")}'`;
    const curlCmd = `curl -X ${method} "${url}" ${headerArgs}${bodyArg}`.trim();
    setCurl(curlCmd);

    const lines: string[] = [];
    lines.push(`const res = await fetch("${url}", {`);
    lines.push(`  method: "${method}",`);
    lines.push(`  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},`);
    if (method !== "GET" && body.trim()) {
      lines.push(`  body: JSON.stringify(${body.trim()}),`);
    }
    lines.push("});");
    lines.push("const data = await res.json();");
    lines.push("console.log(data);");
    setFetchCode(lines.join("\n"));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span>{t("url")}</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </label>
        <label className="text-sm">
          <span>{t("method")}</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span>{t("headers")}</span>
        <textarea
          value={headersText}
          onChange={(e) => setHeadersText(e.target.value)}
          className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </label>
      <label className="block text-sm">
        <span>{t("body")}</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </label>
      <button type="button" className="btn-primary" onClick={run}>
        {t("run")}
      </button>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            {t("curl")}
          </h2>
          <pre className="min-h-28 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900">
            {curl || "—"}
          </pre>
        </div>
        <div>
          <h2 className="mb-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            {t("fetch")}
          </h2>
          <pre className="min-h-28 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900">
            {fetchCode || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
