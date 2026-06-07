"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";

const DEF_TEXT = "Hello\nWorld\nWorld\n\n漢語";

function statsFor(src: string) {
  const lines = src.split(/\r?\n/);
  const words = src.trim() ? src.trim().split(/\s+/) : [];
  return [`chars: ${src.length}`, `lines: ${lines.length}`, `words: ${words.length}`].join("\n");
}

export default function TextPage() {
  const t = useTranslations("text");
  const [text, setText] = useState(DEF_TEXT);
  const [out, setOut] = useState("");

  function stats() {
    setOut(statsFor(text));
  }

  function resetAndRun() {
    setText(DEF_TEXT);
    setOut(statsFor(DEF_TEXT));
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
        className="tool-textarea min-h-48"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <ToolRunActions onRun={stats} onResetAndRun={resetAndRun} />
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={stats} className="tool-chip tool-chip-off">
          {t("stats")}
        </button>
        <button type="button" onClick={dedupe} className="tool-chip tool-chip-off">
          {t("dedupe")}
        </button>
        <button type="button" onClick={blanks} className="tool-chip tool-chip-off">
          {t("blank")}
        </button>
        <button type="button" onClick={() => cases("upper")} className="tool-chip tool-chip-off">
          UPPER
        </button>
        <button type="button" onClick={() => cases("lower")} className="tool-chip tool-chip-off">
          lower
        </button>
        <button type="button" onClick={() => cases("title")} className="tool-chip tool-chip-off">
          Title
        </button>
        <button type="button" onClick={() => han("tw")} className="tool-chip tool-chip-off">
          →繁
        </button>
        <button type="button" onClick={() => han("cn")} className="tool-chip tool-chip-off">
          →简
        </button>
      </div>
      <pre className="tool-pre-out min-h-32">{out || "—"}</pre>
    </div>
  );
}
