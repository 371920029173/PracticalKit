"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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

export default function CsvJsonPage() {
  const t = useTranslations("csvJsonPage");
  const [mode, setMode] = useState<"c2j" | "j2c">("c2j");
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  function run() {
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
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={mode === "c2j" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("c2j")}
        >
          {t("csvToJson")}
        </button>
        <button
          type="button"
          className={mode === "j2c" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("j2c")}
        >
          {t("jsonToCsv")}
        </button>
      </div>
      <textarea
        className="min-h-48 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={mode === "c2j" ? t("csv") : t("json")}
      />
      <button type="button" className="btn-primary" onClick={run}>
        {t("convert")}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <textarea
        readOnly
        className="min-h-48 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900"
        value={out}
      />
    </div>
  );
}
