"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function encodeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtml(s: string): string {
  if (typeof document === "undefined") return s;
  const ta = document.createElement("textarea");
  ta.innerHTML = s;
  return ta.value;
}

const DEF_TEXT = '<div class="x">Tom & Jerry</div>';

export default function HtmlEntitiesPage() {
  const t = useTranslations("htmlEntitiesPage");
  const [text, setText] = useState(DEF_TEXT);
  const [out, setOut] = useState("");

  const runEncode = useCallback(() => {
    setOut(encodeHtml(text));
  }, [text]);

  const resetAndRun = useCallback(() => {
    setText(DEF_TEXT);
    setOut(encodeHtml(DEF_TEXT));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <textarea
        className="tool-textarea min-h-32"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("input")}
      />
      <div className="flex flex-wrap gap-2">
        <ToolRunActions
          onRun={runEncode}
          onResetAndRun={resetAndRun}
          runLabel={t("encode")}
        />
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setOut(decodeHtml(text))}
        >
          {t("decode")}
        </button>
      </div>
      <pre className="tool-pre-out font-mono text-sm">{out || "—"}</pre>
      <p className="text-xs text-slate-500 dark:text-zinc-500">{t("output")}</p>
    </div>
  );
}
