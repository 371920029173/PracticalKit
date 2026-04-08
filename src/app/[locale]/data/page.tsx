"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import YAML from "yaml";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

export default function DataPage() {
  const t = useTranslations("data");
  const [mode, setMode] = useState<"json" | "xml" | "yaml">("json");
  const [text, setText] = useState('{\n  "hello": "world"\n}');
  const [out, setOut] = useState("");

  function format() {
    try {
      if (mode === "json") {
        const o = JSON.parse(text);
        setOut(JSON.stringify(o, null, 2));
      } else if (mode === "yaml") {
        const o = YAML.parse(text);
        setOut(YAML.stringify(o, { indent: 2 }));
      } else {
        const parser = new XMLParser({ ignoreAttributes: false });
        const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
        const o = parser.parse(text);
        setOut(builder.build(o));
      }
    } catch (e) {
      setOut(`Error: ${e}`);
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <div className="flex flex-wrap gap-2">
        {(["json", "xml", "yaml"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`rounded-full px-3 py-1 text-sm uppercase ${
              mode === m ? "bg-white text-zinc-900" : "border border-zinc-700"
            }`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>
      <textarea
        className="min-h-64 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={format}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
        >
          {t("format")}
        </button>
        <button type="button" onClick={minify} className="rounded-lg bg-zinc-800 px-3 py-2 text-sm">
          {t("minify")}
        </button>
        <button
          type="button"
          onClick={validate}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
        >
          {t("validate")}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-black/40 p-3 text-xs text-zinc-200">
        {out}
      </pre>
    </div>
  );
}
