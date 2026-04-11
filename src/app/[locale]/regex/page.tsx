"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const DEFAULT_PATTERN = "\\w+";
const DEFAULT_FLAGS = "g";
const DEFAULT_HAYSTACK = "hello world";

export default function RegexPage() {
  const t = useTranslations("regex");
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [haystack, setHaystack] = useState(DEFAULT_HAYSTACK);
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    const p = pattern.trim();
    if (!p) {
      setOut(t("emptyPattern"));
      return;
    }
    try {
      const re = new RegExp(p, flags);
      const matches = Array.from(haystack.matchAll(re));
      setOut(
        matches.length
          ? matches.map((m) => `${m.index}: ${JSON.stringify(m[0])}`).join("\n")
          : t("noMatches")
      );
    } catch (e) {
      setOut(`${t("errorPrefix")} ${e}`);
    }
  }, [pattern, flags, haystack, t]);

  const resetAndRun = useCallback(() => {
    setPattern(DEFAULT_PATTERN);
    setFlags(DEFAULT_FLAGS);
    setHaystack(DEFAULT_HAYSTACK);
    setOut("");
    queueMicrotask(() => {
      try {
        const re = new RegExp(DEFAULT_PATTERN, DEFAULT_FLAGS);
        const matches = Array.from(DEFAULT_HAYSTACK.matchAll(re));
        setOut(
          matches.length
            ? matches
                .map((m) => `${m.index}: ${JSON.stringify(m[0])}`)
                .join("\n")
            : t("noMatches")
        );
      } catch (e) {
        setOut(`${t("errorPrefix")} ${e}`);
      }
    });
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="tool-muted">{t("pattern")}</span>
          <input
            className="tool-field w-full font-mono"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="tool-muted">{t("flags")}</span>
          <input
            className="tool-field w-full font-mono"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="tool-muted">{t("haystack")}</span>
        <textarea
          className="tool-textarea min-h-36"
          value={haystack}
          onChange={(e) => setHaystack(e.target.value)}
        />
      </label>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      <pre className="tool-pre max-h-64 text-xs">{out || "—"}</pre>
    </div>
  );
}
