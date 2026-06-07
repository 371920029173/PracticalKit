"use client";

import { GpuMorphBench, type GpuBenchResult } from "@/components/bench/GpuMorphBench";
import { ToolPageShell, ToolSection, ToolStatGrid } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";

type BenchKey = "cpu" | "memory" | "gpu" | "dom";
type BenchResult = { score: number; ms: number; detail: string };

function tierFromScore(total: number): "low" | "mid" | "high" | "beast" {
  if (total >= 400) return "beast";
  if (total >= 300) return "high";
  if (total >= 180) return "mid";
  return "low";
}

async function runCpuBench(): Promise<BenchResult> {
  const start = performance.now();
  let n = 0;
  for (let i = 2; i < 180_000; i++) {
    let prime = true;
    for (let d = 2; d * d <= i; d++) {
      if (i % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) n++;
  }
  const ms = performance.now() - start;
  return { score: Math.min(100, Math.round(4200 / ms)), ms, detail: String(n) };
}

async function runMemoryBench(): Promise<BenchResult> {
  const start = performance.now();
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < 48; i++) {
    chunks.push(new Uint8Array(512 * 1024));
    chunks[i]!.fill(i & 255);
  }
  let checksum = 0;
  for (const c of chunks) checksum = (checksum + c[0]! + c.at(-1)!) & 0xffff;
  const ms = performance.now() - start;
  return { score: Math.min(100, Math.round(900 / ms)), ms, detail: String(checksum) };
}

async function runDomBench(): Promise<BenchResult> {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none";
  document.body.appendChild(host);
  const start = performance.now();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 4000; i++) {
    const el = document.createElement("span");
    el.textContent = String(i % 10);
    el.className = "tool-chip-off";
    frag.appendChild(el);
  }
  host.appendChild(frag);
  host.innerHTML = "";
  document.body.removeChild(host);
  const ms = performance.now() - start;
  return { score: Math.min(100, Math.round(1800 / ms)), ms, detail: "4k" };
}

const BENCH_ORDER: BenchKey[] = ["cpu", "memory", "gpu", "dom"];

export default function MushroomBenchPage() {
  const t = useTranslations("mushroomQuizPage");
  const tc = useTranslations("common");
  const [busy, setBusy] = useState(false);
  const [gpuRunning, setGpuRunning] = useState(false);
  const [gpuBenchKey, setGpuBenchKey] = useState(0);
  const [liveFps, setLiveFps] = useState<number | null>(null);
  const [active, setActive] = useState<BenchKey | null>(null);
  const [results, setResults] = useState<Partial<Record<BenchKey, BenchResult>>>({});
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);
  const gpuWaitRef = useRef<((r: BenchResult) => void) | null>(null);

  const deviceInfo = useMemo(
    () => ({
      cores: typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? "—" : "—",
      memory:
        typeof navigator !== "undefined" && "deviceMemory" in navigator
          ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? "—"} GB`
          : t("memoryUnknown"),
      platform: typeof navigator !== "undefined" ? navigator.platform : "—",
      dpr: typeof window !== "undefined" ? String(window.devicePixelRatio) : "—",
    }),
    [t],
  );

  const totalScore = useMemo(
    () => BENCH_ORDER.reduce((sum, key) => sum + (results[key]?.score ?? 0), 0),
    [results],
  );

  const tier = useMemo(() => tierFromScore(totalScore), [totalScore]);

  const toBenchResult = (r: GpuBenchResult): BenchResult => ({
    score: r.score,
    ms: r.ms,
    detail: r.detail,
  });

  const startGpuBench = useCallback(
    () =>
      new Promise<BenchResult>((resolve) => {
        gpuWaitRef.current = resolve;
        setGpuRunning(true);
        setGpuBenchKey((k) => k + 1);
      }),
    [],
  );

  const onGpuComplete = useCallback((raw: GpuBenchResult) => {
    const result = toBenchResult(raw);
    setGpuRunning(false);
    setLiveFps(raw.fps);
    setResults((prev) => ({ ...prev, gpu: result }));
    gpuWaitRef.current?.(result);
    gpuWaitRef.current = null;
  }, []);

  const runOne = useCallback(
    async (key: BenchKey): Promise<BenchResult> => {
      if (key === "gpu") return startGpuBench();
      if (key === "cpu") return runCpuBench();
      if (key === "memory") return runMemoryBench();
      return runDomBench();
    },
    [startGpuBench],
  );

  const runSequence = useCallback(
    async (keys: BenchKey[]) => {
      cancelRef.current = false;
      setBusy(true);
      setProgress(0);
      for (let i = 0; i < keys.length; i++) {
        if (cancelRef.current) break;
        const key = keys[i]!;
        setActive(key);
        const result = await runOne(key);
        if (cancelRef.current) break;
        setResults((prev) => ({ ...prev, [key]: result }));
        setProgress(Math.round(((i + 1) / keys.length) * 100));
      }
      setActive(null);
      setBusy(false);
      setGpuRunning(false);
    },
    [runOne],
  );

  const runAll = useCallback(() => {
    setResults({});
    setLiveFps(null);
    void runSequence(BENCH_ORDER);
  }, [runSequence]);

  const resetAndRun = useCallback(() => {
    setResults({});
    setLiveFps(null);
    void runSequence(BENCH_ORDER);
  }, [runSequence]);

  const stop = useCallback(() => {
    cancelRef.current = true;
    gpuWaitRef.current = null;
    setBusy(false);
    setGpuRunning(false);
    setActive(null);
  }, []);

  const runGpuOnly = useCallback(() => {
    setResults((prev) => {
      const copy = { ...prev };
      delete copy.gpu;
      return copy;
    });
    setLiveFps(null);
    setBusy(true);
    setActive("gpu");
    void runOne("gpu").then((result) => {
      setResults((prev) => ({ ...prev, gpu: result }));
      setActive(null);
      setBusy(false);
    });
  }, [runOne]);

  const fpsOverlay =
    gpuRunning
      ? t("gpuRunning")
      : liveFps != null
        ? t("liveFps", { fps: liveFps })
        : results.gpu
          ? t("liveFps", { fps: parseInt(results.gpu.detail, 10) || 0 })
          : t("gpuPreview");

  return (
    <ToolPageShell title={t("title")} note={t("note")} kicker={t("kicker")}>
      <ToolSection title={t("deviceTitle")} description={t("deviceNote")}>
        <ToolStatGrid
          items={[
            { label: t("cores"), value: deviceInfo.cores },
            { label: t("memory"), value: deviceInfo.memory },
            { label: t("platform"), value: deviceInfo.platform },
            { label: t("dpr"), value: deviceInfo.dpr },
          ]}
        />
      </ToolSection>

      <ToolSection title={t("gpuTitle")} description={t("gpuNote")} pad={false}>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-700/70">
          <GpuMorphBench
            key={gpuBenchKey}
            running={gpuRunning}
            idleSpin={!gpuRunning}
            onComplete={onGpuComplete}
            fpsLabel={fpsOverlay}
          />
        </div>
        <div className="flex flex-wrap gap-2 px-5 pb-5 pt-3">
          <button type="button" className="btn-primary text-sm" disabled={busy} onClick={runGpuOnly}>
            {gpuRunning ? t("gpuRunning") : t("bench_gpu")}
          </button>
        </div>
      </ToolSection>

      <ToolSection title={t("suiteTitle")} description={t("suiteNote")}>
        <div className="flex flex-wrap gap-2">
          <ToolRunActions onRun={runAll} onResetAndRun={resetAndRun} busy={busy} runLabel={t("runAll")} />
          {busy ? (
            <button type="button" className="btn-ghost text-sm" onClick={stop}>
              {t("stop")}
            </button>
          ) : null}
          {BENCH_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className="btn-ghost text-sm"
              disabled={busy}
              onClick={() => {
                setResults((prev) => {
                  const copy = { ...prev };
                  delete copy[key];
                  return copy;
                });
                setActive(key);
                setBusy(true);
                void runOne(key).then((result) => {
                  setResults((prev) => ({ ...prev, [key]: result }));
                  setActive(null);
                  setBusy(false);
                });
              }}
            >
              {t(`bench_${key}`)}
            </button>
          ))}
        </div>

        {busy ? (
          <div className="mt-5 space-y-2">
            <div className="tool-progress-track">
              <div className="tool-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              {active ? t("running", { test: t(`bench_${active}`) }) : t("runningGeneric")}
            </p>
          </div>
        ) : null}
      </ToolSection>

      <ToolSection title={t("resultsTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {BENCH_ORDER.map((key) => {
            const row = results[key];
            return (
              <div key={key} className="tool-result-card">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-white">{t(`bench_${key}`)}</p>
                  <span className="tool-score-pill">{row ? row.score : "—"}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                  {row
                    ? key === "gpu"
                      ? t("benchMetaFps", { ms: Math.round(row.ms), fps: row.detail })
                      : t("benchMeta", { ms: Math.round(row.ms), detail: row.detail })
                    : t("pending")}
                </p>
                <div className="tool-meter mt-3">
                  <div className="tool-meter-fill" style={{ width: `${row?.score ?? 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {totalScore > 0 ? (
          <div className="tool-score-hero mt-6">
            <p className="tool-output-label">{t("totalLabel")}</p>
            <p className="tool-score-total">{totalScore}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{t(`tier_${tier}`)}</p>
            <button
              type="button"
              className="btn-ghost mt-4 text-sm"
              onClick={() =>
                void navigator.clipboard.writeText(
                  `${t("title")}\n${t("totalLabel")}: ${totalScore}\n${t(`tier_${tier}`)}`,
                )
              }
            >
              {tc("copy")}
            </button>
          </div>
        ) : null}
      </ToolSection>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-500">{t("disclaimer")}</p>
    </ToolPageShell>
  );
}
