"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { create, all } from "mathjs";

const math = create(all, {});

const DEFAULT_EXPR = "sqrt(16) + sin(pi/2)";

export default function CalcPage() {
  const t = useTranslations("calc");
  const [expr, setExpr] = useState(DEFAULT_EXPR);
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    try {
      const r = math.evaluate(expr);
      setOut(
        typeof r === "object" && r !== null && "toString" in r
          ? String((r as { toString: () => string }).toString())
          : String(r)
      );
    } catch (e) {
      setOut(`Error: ${e}`);
    }
  }, [expr]);

  const resetAndRun = useCallback(() => {
    setExpr(DEFAULT_EXPR);
    setOut("");
    queueMicrotask(() => {
      try {
        const r = math.evaluate(DEFAULT_EXPR);
        setOut(
          typeof r === "object" && r !== null && "toString" in r
            ? String((r as { toString: () => string }).toString())
            : String(r)
        );
      } catch (e) {
        setOut(`Error: ${e}`);
      }
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("sciNote")}</p>
      <textarea
        className="tool-textarea min-h-28"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      <pre className="tool-pre-out text-lg text-emerald-800 dark:text-emerald-300">
        {out || "—"}
      </pre>
    </div>
  );
}
