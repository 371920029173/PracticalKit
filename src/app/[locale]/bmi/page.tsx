"use client";

import { ToolPageShell, ToolSection, ToolStatGrid } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

function bmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

function category(b: number): "under" | "normal" | "over" | "obese" {
  if (b < 18.5) return "under";
  if (b < 25) return "normal";
  if (b < 30) return "over";
  return "obese";
}

export default function BmiPage() {
  const t = useTranslations("bmiPage");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const run = useCallback(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (Number.isNaN(w) || Number.isNaN(h) || h <= 0 || w <= 0) {
      setResult(null);
      return;
    }
    setResult(Math.round(bmi(w, h) * 10) / 10);
  }, [weight, height]);

  const resetAndRun = useCallback(() => {
    setWeight("70");
    setHeight("175");
    setResult(Math.round(bmi(70, 175) * 10) / 10);
  }, []);

  const idealRange = useMemo(() => {
    const h = parseFloat(height);
    if (Number.isNaN(h) || h <= 0) return null;
    const m = h / 100;
    const low = Math.round(18.5 * m * m * 10) / 10;
    const high = Math.round(24.9 * m * m * 10) / 10;
    return { low, high };
  }, [height]);

  const cat = result != null ? category(result) : null;

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection>
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
        <div className="mt-3">
          <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
        </div>
      </ToolSection>

      {result != null ? (
        <ToolSection title={t("resultTitle")}>
          <ToolStatGrid
            items={[
              { label: "BMI", value: result },
              { label: t("categoryLabel"), value: cat ? t(cat) : "—" },
              ...(idealRange
                ? [{ label: t("idealWeight"), value: `${idealRange.low} – ${idealRange.high} kg` }]
                : []),
            ]}
          />
          <div className="tool-meter mt-4">
            <div
              className="tool-meter-fill"
              style={{ width: `${Math.min(100, (result / 40) * 100)}%` }}
            />
          </div>
        </ToolSection>
      ) : null}

      <p className="text-xs text-slate-500 dark:text-zinc-500">{t("disclaimer")}</p>
    </ToolPageShell>
  );
}
