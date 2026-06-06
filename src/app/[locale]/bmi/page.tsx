"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function bmiCategory(bmi: number, t: (k: string) => string): string {
  if (bmi < 18.5) return t("under");
  if (bmi < 25) return t("normal");
  if (bmi < 30) return t("over");
  return t("obese");
}

export default function BmiPage() {
  const t = useTranslations("bmiPage");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const run = useCallback(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || h <= 0) {
      setBmi(null);
      return;
    }
    const meters = h / 100;
    setBmi(Math.round((w / (meters * meters)) * 10) / 10);
  }, [weight, height]);

  const resetAndRun = useCallback(() => {
    setWeight("70");
    setHeight("175");
    const meters = 1.75;
    setBmi(Math.round((70 / (meters * meters)) * 10) / 10);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-700 dark:text-zinc-300">{t("weight")}</span>
          <input className="tool-field w-full" type="number" min="1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-700 dark:text-zinc-300">{t("height")}</span>
          <input className="tool-field w-full" type="number" min="1" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
      </div>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
      {bmi !== null ? (
        <div className="glass-panel animate-fade-up rounded-2xl p-6 text-center">
          <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{bmi}</p>
          <p className="mt-2 text-sm font-medium text-slate-800 dark:text-zinc-200">{bmiCategory(bmi, t)}</p>
        </div>
      ) : null}
      <p className="text-xs text-amber-800 dark:text-amber-200">{t("disclaimer")}</p>
    </div>
  );
}
