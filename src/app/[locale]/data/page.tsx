"use client";

import { DataTreeView } from "@/components/DataTreeView";
import { ToolRunActions } from "@/components/ToolRunActions";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import YAML from "yaml";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

type DataMode = "json" | "xml" | "yaml";
type IndentStep = 2 | 4;

const DEF_TEXT: Record<DataMode, string> = {
  json: '{\n  "hello": "world"\n}',
  yaml: "hello: world",
  xml: '<?xml version="1.0"?>\n<root>\n  <hello>world</hello>\n</root>',
};

const EXT_BY_MODE: Record<DataMode, string> = {
  json: "json",
  yaml: "yaml",
  xml: "xml",
};

function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  const o = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) {
    out[k] = sortKeysDeep(o[k]);
  }
  return out;
}

function parseToObject(src: string, m: DataMode): unknown {
  if (m === "json") {
    return JSON.parse(src);
  }
  if (m === "yaml") {
    return YAML.parse(src);
  }
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  return parser.parse(src);
}

function serializeObject(
  o: unknown,
  m: DataMode,
  opts: { indent: IndentStep; sortKeys?: boolean },
): string {
  const indent = opts.indent;
  const indentStr = " ".repeat(indent);
  if (m === "json") {
    let v = o;
    if (opts.sortKeys) v = sortKeysDeep(o);
    return JSON.stringify(v, null, indent);
  }
  if (m === "yaml") {
    return YAML.stringify(o, { indent });
  }
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    indentBy: indentStr,
  });
  return builder.build(o);
}

function formatOut(
  src: string,
  m: DataMode,
  opts: { indent: IndentStep; sortKeys?: boolean },
): string {
  try {
    return serializeObject(parseToObject(src, m), m, opts);
  } catch (e) {
    return `Error: ${e}`;
  }
}

function convertBetween(
  src: string,
  from: DataMode,
  to: DataMode,
  opts: { indent: IndentStep; sortKeys?: boolean },
): string {
  try {
    return serializeObject(parseToObject(src, from), to, opts);
  } catch (e) {
    return `Error: ${e}`;
  }
}

function guessModeFromName(name: string): DataMode | null {
  const n = name.toLowerCase();
  if (n.endsWith(".json")) return "json";
  if (n.endsWith(".yaml") || n.endsWith(".yml")) return "yaml";
  if (n.endsWith(".xml")) return "xml";
  return null;
}

function validateWithJsonSchema(data: unknown, schemaText: string): { ok: boolean; message: string } {
  const trimmed = schemaText.trim();
  if (!trimmed) {
    return { ok: false, message: "" };
  }
  let schema: unknown;
  try {
    schema = JSON.parse(trimmed);
  } catch (e) {
    return { ok: false, message: `Schema JSON: ${String(e)}` };
  }
  try {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema as object);
    const valid = validate(data);
    if (valid) {
      return { ok: true, message: "OK" };
    }
    return { ok: false, message: ajv.errorsText(validate.errors, { separator: "\n" }) };
  } catch (e) {
    return { ok: false, message: `Schema: ${String(e)}` };
  }
}

function getByPath(input: unknown, path: string): unknown {
  const normalized = path
    .trim()
    .replace(/\[(\d+)\]/g, ".$1")
    .replace(/^\./, "");
  if (!normalized) {
    return input;
  }
  return normalized.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || typeof acc !== "object") {
      return undefined;
    }
    if (Array.isArray(acc)) {
      const idx = Number(key);
      if (!Number.isInteger(idx)) return undefined;
      return acc[idx];
    }
    return (acc as Record<string, unknown>)[key];
  }, input);
}

export default function DataPage() {
  const t = useTranslations("data");
  const tc = useTranslations("common");
  const [mode, setMode] = useState<DataMode>("json");
  const [text, setText] = useState(DEF_TEXT.json);
  const [out, setOut] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [indent, setIndent] = useState<IndentStep>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [pathQuery, setPathQuery] = useState("");
  const [pathResult, setPathResult] = useState("");
  const [schemaText, setSchemaText] = useState("");
  const [schemaResult, setSchemaResult] = useState("");
  const [schemaIsOk, setSchemaIsOk] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const chars = text.length;
    const bytes = new TextEncoder().encode(text).length;
    return { lines, chars, bytes };
  }, [text]);

  const parseLive = useMemo(() => {
    try {
      const value = parseToObject(text, mode);
      return { ok: true as const, value };
    } catch (e) {
      return { ok: false as const, msg: String(e) };
    }
  }, [text, mode]);

  const topLevelKeys = useMemo(() => {
    if (!parseLive.ok) return [] as string[];
    const value = parseLive.value;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [] as string[];
    }
    return Object.keys(value as Record<string, unknown>).slice(0, 16);
  }, [parseLive]);

  function format() {
    setOut(formatOut(text, mode, { indent, sortKeys }));
  }

  function resetAndRun() {
    const d = DEF_TEXT[mode];
    setText(d);
    setOut(formatOut(d, mode, { indent, sortKeys }));
    setCopyStatus("");
  }

  async function copyOut() {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      setCopyStatus(t("copyOk"));
    } catch {
      setCopyStatus(t("copyFail"));
    }
  }

  function minify() {
    try {
      if (mode === "json") {
        setOut(JSON.stringify(JSON.parse(text)));
      } else if (mode === "yaml") {
        setOut(YAML.stringify(YAML.parse(text)));
      } else {
        const parser = new XMLParser({ ignoreAttributes: false });
        const builder = new XMLBuilder({ format: false, ignoreAttributes: false });
        setOut(builder.build(parser.parse(text)));
      }
    } catch (e) {
      setOut(`Error: ${e}`);
    }
  }

  function validate() {
    try {
      if (mode === "json") {
        JSON.parse(text);
      } else if (mode === "yaml") {
        YAML.parse(text);
      } else {
        new XMLParser({ ignoreAttributes: false }).parse(text);
      }
      setOut("OK");
    } catch (e) {
      setOut(`Invalid: ${e}`);
    }
  }

  function convertTo(target: DataMode) {
    const next = convertBetween(text, mode, target, { indent, sortKeys });
    if (next.startsWith("Error:")) {
      setOut(next);
      return;
    }
    setMode(target);
    setText(next);
    setOut(next);
    setCopyStatus("");
  }

  function triggerLoad() {
    fileRef.current?.click();
  }

  function runSchemaValidate() {
    if (!parseLive.ok) {
      setSchemaIsOk(false);
      setSchemaResult(t("schemaNeedParse"));
      return;
    }
    if (!schemaText.trim()) {
      setSchemaIsOk(false);
      setSchemaResult(t("schemaEmpty"));
      return;
    }
    const r = validateWithJsonSchema(parseLive.value, schemaText);
    setSchemaIsOk(r.ok);
    setSchemaResult(r.ok ? t("schemaOk") : r.message || t("schemaFail"));
  }

  function runPathQuery() {
    if (!parseLive.ok) {
      setPathResult(t("pathNeedValid"));
      return;
    }
    try {
      const value = getByPath(parseLive.value, pathQuery);
      if (typeof value === "undefined") {
        setPathResult(t("pathNotFound"));
        return;
      }
      setPathResult(JSON.stringify(value, null, 2));
    } catch (e) {
      setPathResult(`Error: ${String(e)}`);
    }
  }

  function onFilePick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const inferred = guessModeFromName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? "");
      setText(raw);
      setOut("");
      setCopyStatus("");
      if (inferred) {
        setMode(inferred);
      }
    };
    reader.readAsText(f, "UTF-8");
    e.target.value = "";
  }

  function downloadOutput() {
    let body = text;
    if (
      out.length > 0 &&
      !out.startsWith("Error:") &&
      !out.startsWith("Invalid:") &&
      out !== "OK"
    ) {
      body = out;
    }
    if (!body.trim()) return;
    const ext = EXT_BY_MODE[mode];
    const name = `data.${ext}`;
    const blob = new Blob([body], { type: "application/octet-stream;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const errPreview =
    parseLive.ok || !parseLive.msg ? "" : parseLive.msg.length > 140 ? `${parseLive.msg.slice(0, 140)}…` : parseLive.msg;

  const outIsError = out.startsWith("Error:") || out.startsWith("Invalid:");
  const showResult = out.length > 0;

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted max-w-2xl">{t("privacyLine")}</p>
      <div className="flex flex-wrap gap-2">
        {(["json", "xml", "yaml"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`tool-chip ${mode === m ? "tool-chip-on" : "tool-chip-off"}`}
            onClick={() => {
              setMode(m);
              setText(DEF_TEXT[m]);
              setOut("");
              setCopyStatus("");
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">{t("indentLabel")}</span>
        {([2, 4] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setIndent(n)}
            className={`rounded-lg px-2.5 py-1 ${
              indent === n
                ? "bg-indigo-600 text-white"
                : "border border-zinc-600 bg-zinc-800 text-zinc-200 dark:border-zinc-600"
            }`}
          >
            {n}
          </button>
        ))}
        {mode === "json" ? (
          <label className="flex cursor-pointer items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded border-zinc-500"
            />
            {t("sortKeys")}
          </label>
        ) : null}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        {t("stats", { lines: stats.lines, chars: stats.chars, bytes: stats.bytes })}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 font-mono text-xs ${
            parseLive.ok
              ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-500/15 text-rose-900 dark:text-rose-200"
          }`}
          title={parseLive.ok ? undefined : parseLive.msg}
        >
          {parseLive.ok ? t("parseOk") : `${t("parseErr")}: ${errPreview}`}
        </span>
      </div>

      <textarea
        className="tool-textarea min-h-64 dark:border-zinc-700 dark:bg-zinc-950"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            format();
          }
        }}
        spellCheck={false}
      />
      <p className="text-xs text-zinc-500">{t("shortcutHint")}</p>

      <input ref={fileRef} type="file" accept=".json,.yaml,.yml,.xml,application/json,text/yaml,text/xml" className="sr-only" onChange={onFilePick} />

      <p className="text-xs text-zinc-500">{t("convertNote")}</p>
      <div>
        <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{t("convertTitle")}</p>
        <div className="flex flex-wrap gap-2">
          {(["json", "xml", "yaml"] as const).map((target) => (
            <button
              key={target}
              type="button"
              disabled={target === mode}
              onClick={() => convertTo(target)}
              className={`rounded-lg px-3 py-2 text-sm ${
                target === mode
                  ? "cursor-not-allowed border border-zinc-800 text-zinc-600"
                  : "border border-zinc-600 bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {target === "json" ? t("convertJson") : target === "yaml" ? t("convertYaml") : t("convertXml")}
            </button>
          ))}
        </div>
      </div>
      <ToolRunActions onRun={format} onResetAndRun={resetAndRun} />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={format} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">
          {t("format")}
        </button>
        <button type="button" onClick={minify} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm dark:bg-zinc-800">
          {t("minify")}
        </button>
        <button type="button" onClick={validate} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm dark:bg-zinc-800">
          {t("validate")}
        </button>
        <button type="button" onClick={() => void copyOut()} className="btn-ghost text-sm" disabled={!out}>
          {tc("copy")}
        </button>
        <button type="button" onClick={triggerLoad} className="btn-ghost text-sm">
          {tc("upload")}
        </button>
        <button type="button" onClick={downloadOutput} className="btn-ghost text-sm">
          {tc("download")}
        </button>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{t("treeTitle")}</p>
        <p className="mt-1 text-xs text-zinc-500">{t("treeHint")}</p>
        {parseLive.ok ? (
          <div className="mt-2">
            <DataTreeView
              data={parseLive.value}
              onPickPath={(p) => {
                setPathQuery(p);
                setPathResult("");
              }}
              emptyLabel={t("treeEmpty")}
              tooLargeLabel={t("treeTooLarge")}
            />
          </div>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">{t("treeNeedParse")}</p>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{t("schemaTitle")}</p>
        <p className="mt-1 text-xs text-zinc-500">{t("schemaHint")}</p>
        <textarea
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
          placeholder={t("schemaPlaceholder")}
          className="tool-textarea mt-2 min-h-28 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950"
          spellCheck={false}
        />
        <button type="button" className="btn-ghost mt-2 text-sm" onClick={runSchemaValidate}>
          {t("schemaRun")}
        </button>
        {schemaResult ? (
          <pre
            className={`tool-pre-out mt-2 text-xs ${
              schemaIsOk
                ? "border-emerald-300/60 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/25"
                : "border-rose-300/60 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30"
            }`}
          >
            {schemaResult}
          </pre>
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{t("pathTitle")}</p>
        <p className="mt-1 text-xs text-zinc-500">{t("pathHint")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={pathQuery}
            onChange={(e) => setPathQuery(e.target.value)}
            placeholder={t("pathPlaceholder")}
            className="tool-field w-full max-w-xl font-mono"
          />
          <button type="button" className="btn-ghost text-sm" onClick={runPathQuery}>
            {t("pathRun")}
          </button>
        </div>
        {topLevelKeys.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {topLevelKeys.map((k) => (
              <button
                key={k}
                type="button"
                className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                onClick={() => setPathQuery(k)}
              >
                {k}
              </button>
            ))}
          </div>
        ) : null}
        {pathResult ? <pre className="tool-pre-out mt-3 text-xs">{pathResult}</pre> : null}
      </div>
      {copyStatus ? <p className="text-xs text-zinc-500">{copyStatus}</p> : null}
      {showResult ? (
        <div>
          <p className="mb-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">{tc("result")}</p>
          <pre
            className={`tool-pre-out max-h-96 min-h-[4.5rem] text-xs ${
              outIsError
                ? "border-rose-300/60 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30"
                : out === "OK"
                  ? "border-emerald-300/60 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/25"
                  : ""
            }`}
          >
            {out}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
