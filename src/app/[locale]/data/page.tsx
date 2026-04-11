"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";
import YAML from "yaml";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

type DataMode = "json" | "xml" | "yaml";

const DEF_TEXT: Record<DataMode, string> = {
  json: '{\n  "hello": "world"\n}',
  yaml: "hello: world",
  xml: '<?xml version="1.0"?>\n<root>\n  <hello>world</hello>\n</root>',
};

function formatOut(src: string, m: DataMode): string {
  try {
    if (m === "json") {
      const o = JSON.parse(src);
      return JSON.stringify(o, null, 2);
    }
    if (m === "yaml") {
      const o = YAML.parse(src);
      return YAML.stringify(o, { indent: 2 });
    }
    const parser = new XMLParser({ ignoreAttributes: false });
    const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
    const o = parser.parse(src);
    return builder.build(o);
  } catch (e) {
    return `Error: ${e}`;
  }
}

export default function DataPage() {
  const t = useTranslations("data");
  const [mode, setMode] = useState<DataMode>("json");
  const [text, setText] = useState(DEF_TEXT.json);
  const [out, setOut] = useState("");

  function format() {
    setOut(formatOut(text, mode));
  }

  function resetAndRun() {
    const d = DEF_TEXT[mode];
    setText(d);
    setOut(formatOut(d, mode));
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
      <h1 className="tool-h1">{t("title")}</h1>
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
      <ToolRunActions onRun={format} onResetAndRun={resetAndRun} />
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
