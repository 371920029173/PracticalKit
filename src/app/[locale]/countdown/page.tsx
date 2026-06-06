"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

function formatMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CountdownPage() {
  const t = useTranslations("countdownPage");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const endRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (endRef.current == null) return;
    const left = endRef.current - Date.now();
    if (left <= 0) {
      setRemaining(0);
      setRunning(false);
      endRef.current = null;
      return;
    }
    setRemaining(left);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, tick]);

  const start = useCallback(() => {
    if (remaining != null && remaining > 0 && !running && endRef.current == null) {
      endRef.current = Date.now() + remaining;
      setRunning(true);
      return;
    }
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;
    const total = (m * 60 + s) * 1000;
    if (total <= 0) return;
    endRef.current = Date.now() + total;
    setRemaining(total);
    setRunning(true);
  }, [minutes, seconds, remaining, running]);

  const pause = useCallback(() => {
    if (endRef.current != null) {
      setRemaining(Math.max(0, endRef.current - Date.now()));
    }
    setRunning(false);
    endRef.current = null;
  }, []);

  const reset = useCallback(() => {
    pause();
    setRemaining(null);
    setMinutes("5");
    setSeconds("0");
  }, [pause]);

  const done = remaining === 0;

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      {!running && remaining == null ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>{t("minutes")}</span>
            <input className="tool-field w-full" type="number" min="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span>{t("seconds")}</span>
            <input className="tool-field w-full" type="number" min="0" max="59" value={seconds} onChange={(e) => setSeconds(e.target.value)} />
          </label>
        </div>
      ) : null}
      <div
        className={`glass-panel flex min-h-[10rem] flex-col items-center justify-center rounded-2xl p-8 ${
          done ? "animate-fade-up ring-2 ring-emerald-400/60" : ""
        }`}
      >
        <p className="font-mono text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
          {remaining != null ? formatMs(remaining) : "05:00"}
        </p>
        {done ? <p className="mt-3 text-lg font-semibold text-emerald-600">{t("done")}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {!running ? (
          <button type="button" className="btn-primary" onClick={start}>
            {remaining != null && !done ? t("resume") : t("start")}
          </button>
        ) : (
          <button type="button" className="btn-ghost" onClick={pause}>
            {t("pause")}
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={reset}>
          {t("reset")}
        </button>
      </div>
    </div>
  );
}
