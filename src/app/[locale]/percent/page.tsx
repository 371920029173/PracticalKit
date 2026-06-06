"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

type Mode = "of" | "is" | "change";

export default function PercentPage() {
  const t = useTranslations("percentPage");
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      setOut(t("invalid"));
      return;
    }
    if (mode === "of") setOut(String(Math.round(x * y) / 100));
    else if (mode === "is") setOut(y === 0 ? t("invalid") : `${Math.round((x / y) * 10000) / 100}%`);
    else setOut(String(Math.round(x * (1 + y / 100) * 100) / 100));
  }, [a, b, mode, t]);

  const resetAndRun = useCallback(() => {
    setMode("of");
    setA("20");
    setB("150");
    setOut("30");
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex flex-wrap gap-2">
        {(["of", "is", "change"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`tool-chip ${mode === m ? "tool-chip-on" : "tool-chip-off"}`}
            onClick={() => setMode(m)}
          >
            {t(`mode_${m}`)}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t(`hint_${mode}`)}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-700 dark:text-zinc-300">{t("valueA")}</span>
          <input className="tool-field w-full" type="number" value={a} onChange={(e) => setA(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-700 dark:text-zinc-300">{t("valueB")}</span>
          <input className="tool-field w-full" type="number" value={b} onChange={(e) => setB(e.target.value)} />
        </label>
      </div>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
      <pre className="tool-pre-out text-lg font-semibold">{out || "—"}</pre>
    </div>
  );
}
