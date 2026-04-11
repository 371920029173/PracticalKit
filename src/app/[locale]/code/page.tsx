"use client";

import { useTranslations } from "next-intl";
import { diffLines } from "diff";
import { useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-okaidia.css";

const DEF_CODE = `const x: number = 1;\nconsole.log(x);\n`;
const DEF_A = "line one\nline two\n";
const DEF_B = "line one\nline changed\n";

export default function CodePage() {
  const t = useTranslations("code");
  const tc = useTranslations("common");
  const [tab, setTab] = useState<"hi" | "df">("hi");
  const [lang, setLang] = useState("typescript");
  const [code, setCode] = useState(DEF_CODE);
  const [a, setA] = useState(DEF_A);
  const [b, setB] = useState(DEF_B);

  const highlighted =
    tab === "hi"
      ? Prism.highlight(
          code,
          Prism.languages[lang] ?? Prism.languages.typescript!,
          lang
        )
      : "";

  const diffOut =
    tab === "df"
      ? diffLines(a, b)
          .map((p) =>
            p.added
              ? `+ ${p.value}`
              : p.removed
                ? `- ${p.value}`
                : `  ${p.value}`
          )
          .join("")
      : "";

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`tool-chip ${tab === "hi" ? "tool-chip-on" : "tool-chip-off"}`}
          onClick={() => setTab("hi")}
        >
          {t("highlight")}
        </button>
        <button
          type="button"
          className={`tool-chip ${tab === "df" ? "tool-chip-on" : "tool-chip-off"}`}
          onClick={() => setTab("df")}
        >
          {t("diff")}
        </button>
      </div>
      {tab === "hi" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="tool-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="typescript">typescript</option>
              <option value="javascript">javascript</option>
              <option value="json">json</option>
            </select>
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={() => {
                setCode(DEF_CODE);
                setLang("typescript");
              }}
            >
              {tc("resetAndRun")}
            </button>
          </div>
          <textarea
            className="tool-textarea min-h-56"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="overflow-auto rounded-lg border border-slate-800 bg-[#272822] p-3">
            <pre
              className="text-sm text-[#f8f8f2]"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => {
              setA(DEF_A);
              setB(DEF_B);
            }}
          >
            {tc("resetAndRun")}
          </button>
          <div className="grid gap-3 md:grid-cols-2">
            <textarea
              className="tool-textarea min-h-48 text-xs"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
            <textarea
              className="tool-textarea min-h-48 text-xs"
              value={b}
              onChange={(e) => setB(e.target.value)}
            />
          </div>
          <pre className="tool-pre max-h-80 text-xs">{diffOut}</pre>
        </>
      )}
    </div>
  );
}
