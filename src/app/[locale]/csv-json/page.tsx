"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

/** Minimal CSV parser (quoted fields). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQ = false;
  const s = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  while (i < s.length) {
    const c = s[i]!;
    if (inQ) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQ = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQ = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  rows.push(row);
  while (rows.length && rows[rows.length - 1]!.every((c) => c === "")) rows.pop();
  return rows;
}

function csvToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0]!.map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, j) => {
      o[h] = r[j] ?? "";
    });
    return o;
  });
}

function objectsToCsv(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0)
    throw new Error("need array");
  const first = data[0];
  if (typeof first !== "object" || first === null) throw new Error("objects");
  const keys = Object.keys(first as object);
  const esc = (v: string) => {
    if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = [keys.join(",")];
  for (const row of data) {
    const o = row as Record<string, unknown>;
    lines.push(keys.map((k) => esc(String(o[k] ?? ""))).join(","));
  }
  return lines.join("\n");
}

const DEF_CSV = "name,age\nAlice,30\nBob,25\n";
const DEF_JSON = '[\n  { "name": "Alice", "age": "30" },\n  { "name": "Bob", "age": "25" }\n]';

export default function CsvJsonPage() {
  const t = useTranslations("csvJsonPage");
  const [mode, setMode] = useState<"c2j" | "j2c">("c2j");
  const [text, setText] = useState(DEF_CSV);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  const run = useCallback(() => {
    setErr("");
    setOut("");
    try {
      if (mode === "c2j") {
        const rows = parseCsv(text.trim());
        const obj = csvToObjects(rows);
        setOut(JSON.stringify(obj, null, 2));
      } else {
        const parsed = JSON.parse(text) as unknown;
        setOut(objectsToCsv(parsed));
      }
    } catch (e) {
      setErr(`${t("err")}: ${e instanceof Error ? e.message : e}`);
    }
  }, [mode, t, text]);

  const resetAndRun = useCallback(() => {
    setMode("c2j");
    setText(DEF_CSV);
    setErr("");
    setOut("");
    queueMicrotask(() => {
      try {
        const rows = parseCsv(DEF_CSV.trim());
        const obj = csvToObjects(rows);
        setOut(JSON.stringify(obj, null, 2));
      } catch (e) {
        setErr(`${t("err")}: ${e instanceof Error ? e.message : e}`);
      }
    });
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={mode === "c2j" ? "tool-chip tool-chip-on" : "tool-chip tool-chip-off"}
          onClick={() => {
            setMode("c2j");
            setText(DEF_CSV);
            setOut("");
            setErr("");
          }}
        >
          {t("csvToJson")}
        </button>
        <button
          type="button"
          className={mode === "j2c" ? "tool-chip tool-chip-on" : "tool-chip tool-chip-off"}
          onClick={() => {
            setMode("j2c");
            setText(DEF_JSON);
            setOut("");
            setErr("");
          }}
        >
          {t("jsonToCsv")}
        </button>
      </div>
      <textarea
        className="tool-textarea min-h-48"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={mode === "c2j" ? t("csv") : t("json")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      {err && (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      )}
      <textarea
        readOnly
        className="tool-textarea min-h-48 bg-slate-50 dark:bg-zinc-900/50"
        value={out}
        aria-label={t("title")}
      />
    </div>
  );
}
