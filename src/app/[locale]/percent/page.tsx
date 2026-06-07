"use client";

import { ToolPageShell, ToolSection, ToolOutput } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type Mode = "of" | "is" | "change" | "delta";

function calc(mode: Mode, a: number, b: number): string | null {
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  if (mode === "of") return String(Math.round(a * b) / 100);
  if (mode === "is") return b === 0 ? null : `${Math.round((a / b) * 10000) / 100}%`;
  if (mode === "change") return String(Math.round(a * (1 + b / 100) * 100) / 100);
  return b === 0 ? null : `${Math.round(((a - b) / b) * 10000) / 100}%`;
}

export default function PercentPage() {
  const t = useTranslations("percentPage");
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [out, setOut] = useState("");
  const [live, setLive] = useState(true);

  const preview = useMemo(() => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    const result = calc(mode, x, y);
    return result ?? "";
  }, [a, b, mode]);

  useEffect(() => {
    if (live) setOut(preview || (a || b ? t("invalid") : ""));
  }, [live, preview, a, b, t]);

  const run = useCallback(() => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    const result = calc(mode, x, y);
    setOut(result ?? t("invalid"));
  }, [a, b, mode, t]);

  const resetAndRun = useCallback(() => {
    setMode("of");
    setA("20");
    setB("150");
    setOut("30");
  }, []);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection>
        <div className="flex flex-wrap gap-2">
          {(["of", "is", "change", "delta"] as const).map((m) => (
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
        <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400">{t(`hint_${mode}`)}</p>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
          <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
          {t("liveCalc")}
        </label>
      </ToolSection>

      <ToolSection>
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
        {!live ? <div className="mt-3"><ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} /></div> : null}
      </ToolSection>

      <ToolOutput label={t("resultLabel")}>
        {out || preview || "—"}
      </ToolOutput>
    </ToolPageShell>
  );
}
