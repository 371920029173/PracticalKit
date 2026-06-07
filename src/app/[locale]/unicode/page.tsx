"use client";

import { ToolPageShell } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function inspect(s: string): string {
  const lines: string[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    lines.push(`U+${hex}\t${ch}`);
  }
  return lines.join("\n");
}

const DEF_TEXT = "Hello 你好 🎉";

export default function UnicodePage() {
  const t = useTranslations("unicodePage");
  const [text, setText] = useState(DEF_TEXT);
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    setOut(inspect(text));
  }, [text]);

  const resetAndRun = useCallback(() => {
    setText(DEF_TEXT);
    setOut(inspect(DEF_TEXT));
  }, []);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <textarea
        className="tool-textarea min-h-24"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("input")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      <pre className="tool-pre min-h-48 text-sm">{out || "—"}</pre>
    </ToolPageShell>
  );
}
