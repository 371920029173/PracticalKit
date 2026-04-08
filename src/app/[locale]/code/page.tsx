"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-okaidia.css";
import { diffLines } from "diff";

export default function CodePage() {
  const t = useTranslations("code");
  const [tab, setTab] = useState<"hi" | "df">("hi");
  const [lang, setLang] = useState("typescript");
  const [code, setCode] = useState(`const x: number = 1;\nconsole.log(x);\n`);
  const [a, setA] = useState("line one\nline two\n");
  const [b, setB] = useState("line one\nline changed\n");

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
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-sm ${tab === "hi" ? "bg-white text-zinc-900" : "border border-zinc-700"}`}
          onClick={() => setTab("hi")}
        >
          {t("highlight")}
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-sm ${tab === "df" ? "bg-white text-zinc-900" : "border border-zinc-700"}`}
          onClick={() => setTab("df")}
        >
          {t("diff")}
        </button>
      </div>
      {tab === "hi" ? (
        <>
          <select
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="typescript">typescript</option>
            <option value="javascript">javascript</option>
            <option value="json">json</option>
          </select>
          <textarea
            className="min-h-56 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <pre
            className="overflow-auto rounded-lg p-3 text-sm"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <textarea
              className="min-h-48 w-full rounded border border-zinc-700 bg-zinc-900 p-2 font-mono text-xs"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
            <textarea
              className="min-h-48 w-full rounded border border-zinc-700 bg-zinc-900 p-2 font-mono text-xs"
              value={b}
              onChange={(e) => setB(e.target.value)}
            />
          </div>
          <pre className="max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-black/50 p-3 font-mono text-xs text-zinc-300">
            {diffOut}
          </pre>
        </>
      )}
    </div>
  );
}
