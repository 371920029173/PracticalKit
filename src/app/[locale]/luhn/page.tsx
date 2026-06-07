"use client";

import { ToolPageShell } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function luhnValid(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function maskCard(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length < 4) return d;
  return `${"•".repeat(Math.max(0, d.length - 4))}${d.slice(-4)}`;
}

export default function LuhnPage() {
  const t = useTranslations("luhnPage");
  const [input, setInput] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);

  const run = useCallback(() => {
    setValid(luhnValid(input));
  }, [input]);

  const resetAndRun = useCallback(() => {
    const sample = "4242424242424242";
    setInput(sample);
    setValid(luhnValid(sample));
  }, []);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <input
        className="tool-field w-full font-mono"
        inputMode="numeric"
        autoComplete="off"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("placeholder")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
      {valid !== null ? (
        <div
          className={`glass-panel animate-fade-up rounded-2xl p-6 text-center ${
            valid ? "ring-1 ring-emerald-400/50" : "ring-1 ring-rose-400/50"
          }`}
        >
          <p className="text-2xl font-bold">{valid ? t("valid") : t("invalid")}</p>
          <p className="mt-2 font-mono text-sm text-slate-600 dark:text-zinc-400">{maskCard(input)}</p>
        </div>
      ) : null}
      <p className="text-xs text-amber-800 dark:text-amber-200">{t("disclaimer")}</p>
    </ToolPageShell>
  );
}
