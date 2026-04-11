"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

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

const DEF_URL = "https://api.example.com/items";
const DEF_HEADERS = "Content-Type: application/json";
const DEF_BODY = '{\n  "name": "item"\n}';

export default function ApiSnippetPage() {
  const t = useTranslations("apiSnippetPage");
  const [url, setUrl] = useState(DEF_URL);
  const [method, setMethod] = useState("GET");
  const [headersText, setHeadersText] = useState(DEF_HEADERS);
  const [body, setBody] = useState(DEF_BODY);
  const [curl, setCurl] = useState("");
  const [fetchCode, setFetchCode] = useState("");

  const run = useCallback(() => {
    const headers = parseHeaders(headersText);
    const headerArgs = Object.entries(headers)
      .map(([k, v]) => `-H "${k}: ${v.replace(/"/g, '\\"')}"`)
      .join(" ");
    const bodyArg =
      method === "GET" || !body.trim()
        ? ""
        : ` -d ${JSON.stringify(body)}`;
    const curlCmd = `curl -X ${method} "${url}" ${headerArgs}${bodyArg}`.trim();
    setCurl(curlCmd);

    const lines: string[] = [];
    lines.push(`const res = await fetch(${JSON.stringify(url)}, {`);
    lines.push(`  method: ${JSON.stringify(method)},`);
    lines.push(
      `  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},`
    );
    if (method !== "GET" && body.trim()) {
      lines.push(`  body: ${JSON.stringify(body)},`);
    }
    lines.push("});");
    lines.push("const data = await res.json();");
    lines.push("console.log(data);");
    setFetchCode(lines.join("\n"));
  }, [body, headersText, method, url]);

  const resetAndRun = useCallback(() => {
    setUrl(DEF_URL);
    setMethod("GET");
    setHeadersText(DEF_HEADERS);
    setBody(DEF_BODY);
    queueMicrotask(() => {
      const headers = parseHeaders(DEF_HEADERS);
      const headerArgs = Object.entries(headers)
        .map(([k, v]) => `-H "${k}: ${v.replace(/"/g, '\\"')}"`)
        .join(" ");
      const curlCmd = `curl -X GET "${DEF_URL}" ${headerArgs}`.trim();
      setCurl(curlCmd);
      const lines: string[] = [];
      lines.push(`const res = await fetch(${JSON.stringify(DEF_URL)}, {`);
      lines.push(`  method: "GET",`);
      lines.push(
        `  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},`
      );
      lines.push("});");
      lines.push("const data = await res.json();");
      lines.push("console.log(data);");
      setFetchCode(lines.join("\n"));
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="text-slate-700 dark:text-zinc-300">{t("url")}</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="tool-field mt-1 w-full font-mono"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-700 dark:text-zinc-300">{t("method")}</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="tool-select mt-1 w-full"
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-slate-700 dark:text-zinc-300">{t("headers")}</span>
        <textarea
          value={headersText}
          onChange={(e) => setHeadersText(e.target.value)}
          className="tool-textarea mt-1 min-h-20"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-700 dark:text-zinc-300">{t("body")}</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="tool-textarea mt-1 min-h-28"
        />
      </label>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} runLabel={t("run")} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            {t("curl")}
          </h2>
          <pre className="tool-pre min-h-28 text-xs">{curl || "—"}</pre>
        </div>
        <div>
          <h2 className="mb-1 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            {t("fetch")}
          </h2>
          <pre className="tool-pre min-h-28 text-xs">{fetchCode || "—"}</pre>
        </div>
      </div>
    </div>
  );
}
