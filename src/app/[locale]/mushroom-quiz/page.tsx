"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const QUESTION_IDS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export default function MushroomQuizPage() {
  const t = useTranslations("mushroomQuizPage");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const qId = QUESTION_IDS[index];
  const options = [0, 1, 2, 3] as const;
  const correct = Number(t(`${qId}.correct`));

  const progress = useMemo(
    () => Math.round(((index + (picked !== null ? 1 : 0)) / QUESTION_IDS.length) * 100),
    [index, picked],
  );

  const pick = useCallback(
    (opt: number) => {
      if (picked !== null || done) return;
      setPicked(opt);
      if (opt === correct) setScore((s) => s + 1);
    },
    [picked, done, correct],
  );

  const next = useCallback(() => {
    if (index >= QUESTION_IDS.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }, [index]);

  const restart = useCallback(() => {
    setIndex(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  }, []);

  if (done) {
    return (
      <div className="animate-fade-up space-y-4">
        <h1 className="tool-h1">{t("title")}</h1>
        <div className="glass-panel rounded-2xl p-6 text-center">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {score}/{QUESTION_IDS.length}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{t("resultLead")}</p>
          <p className="mt-4 text-xs text-amber-800 dark:text-amber-200">{t("disclaimer")}</p>
          <button type="button" className="btn-primary mt-6" onClick={restart}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        {t("progress", { current: index + 1, total: QUESTION_IDS.length })}
      </p>
      <div className="glass-panel animate-fade-up space-y-4 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t(`${qId}.prompt`)}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const isCorrect = opt === correct;
            const isPicked = picked === opt;
            let cls = "tool-chip-off w-full text-left px-4 py-3";
            if (picked !== null) {
              if (isCorrect) cls = "w-full rounded-xl border border-emerald-400 bg-emerald-50 px-4 py-3 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100";
              else if (isPicked) cls = "w-full rounded-xl border border-rose-400 bg-rose-50 px-4 py-3 text-rose-900 dark:bg-rose-950/50 dark:text-rose-100";
              else cls = "tool-chip-off w-full text-left px-4 py-3 opacity-60";
            }
            return (
              <li key={opt}>
                <button type="button" className={`btn-motion ${cls}`} onClick={() => pick(opt)} disabled={picked !== null}>
                  {t(`${qId}.options.${opt}`)}
                </button>
              </li>
            );
          })}
        </ul>
        {picked !== null ? (
          <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-zinc-700">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-zinc-300">{t(`${qId}.explain`)}</p>
            <button type="button" className="btn-primary text-sm" onClick={next}>
              {index >= QUESTION_IDS.length - 1 ? t("finish") : t("next")}
            </button>
          </div>
        ) : null}
      </div>
      <p className="text-xs text-amber-800 dark:text-amber-200">{t("disclaimer")}</p>
    </div>
  );
}
