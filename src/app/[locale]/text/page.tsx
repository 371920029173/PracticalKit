"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function TextPage() {
  const t = useTranslations("text");
  const [text, setText] = useState("Hello\nWorld\nWorld\n\n漢語");
  const [out, setOut] = useState("");

  function stats() {
    const lines = text.split(/\r?\n/);
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    setOut(
      [
        `chars: ${text.length}`,
        `lines: ${lines.length}`,
        `words: ${words.length}`,
      ].join("\n")
    );
  }

  function dedupe() {
    const seen = new Set<string>();
    const outLines: string[] = [];
    for (const line of text.split(/\r?\n/)) {
      if (seen.has(line)) continue;
      seen.add(line);
      outLines.push(line);
    }
    setOut(outLines.join("\n"));
  }

  function blanks() {
    setOut(
      text
        .split(/\r?\n/)
        .filter((l) => l.trim() !== "")
        .join("\n")
    );
  }

  function cases(kind: string) {
    if (kind === "upper") setOut(text.toUpperCase());
    else if (kind === "lower") setOut(text.toLowerCase());
    else if (kind === "title")
      setOut(
        text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      );
  }

  async function han(to: "tw" | "cn") {
    try {
      const OpenCC = await import("opencc-js");
      const converter = OpenCC.Converter(
        to === "tw" ? { from: "cn", to: "tw" } : { from: "tw", to: "cn" }
      );
      setOut(converter(text));
    } catch (e) {
      setOut(`OpenCC error: ${e}`);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <textarea
        className="min-h-48 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={stats} className="rounded-lg bg-zinc-800 px-3 py-2">
          {t("stats")}
        </button>
        <button type="button" onClick={dedupe} className="rounded-lg bg-zinc-800 px-3 py-2">
          {t("dedupe")}
        </button>
        <button type="button" onClick={blanks} className="rounded-lg bg-zinc-800 px-3 py-2">
          {t("blank")}
        </button>
        <button type="button" onClick={() => cases("upper")} className="rounded-lg bg-zinc-800 px-3 py-2">
          UPPER
        </button>
        <button type="button" onClick={() => cases("lower")} className="rounded-lg bg-zinc-800 px-3 py-2">
          lower
        </button>
        <button type="button" onClick={() => cases("title")} className="rounded-lg bg-zinc-800 px-3 py-2">
          Title
        </button>
        <button type="button" onClick={() => han("tw")} className="rounded-lg bg-zinc-800 px-3 py-2">
          →繁
        </button>
        <button type="button" onClick={() => han("cn")} className="rounded-lg bg-zinc-800 px-3 py-2">
          →简
        </button>
      </div>
      <pre className="min-h-32 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-black/40 p-3 text-sm text-zinc-200">
        {out}
      </pre>
    </div>
  );
}
