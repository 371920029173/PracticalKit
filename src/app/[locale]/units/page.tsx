"use client";

import { ToolPageShell } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Cat = "length" | "mass" | "temp" | "speed" | "area" | "volume";

const TABLES: Record<
  Cat,
  { unit: string; toBase: (n: number) => number; fromBase: (n: number) => number }[]
> = {
  length: [
    { unit: "m", toBase: (n) => n, fromBase: (n) => n },
    { unit: "km", toBase: (n) => n * 1000, fromBase: (n) => n / 1000 },
    { unit: "cm", toBase: (n) => n / 100, fromBase: (n) => n * 100 },
    { unit: "mm", toBase: (n) => n / 1000, fromBase: (n) => n * 1000 },
    { unit: "mi", toBase: (n) => n * 1609.344, fromBase: (n) => n / 1609.344 },
    { unit: "ft", toBase: (n) => n * 0.3048, fromBase: (n) => n / 0.3048 },
    { unit: "in", toBase: (n) => n * 0.0254, fromBase: (n) => n / 0.0254 },
  ],
  mass: [
    { unit: "kg", toBase: (n) => n, fromBase: (n) => n },
    { unit: "g", toBase: (n) => n / 1000, fromBase: (n) => n * 1000 },
    { unit: "lb", toBase: (n) => n * 0.45359237, fromBase: (n) => n / 0.45359237 },
    { unit: "oz", toBase: (n) => n * 0.028349523125, fromBase: (n) => n / 0.028349523125 },
  ],
  temp: [
    {
      unit: "C",
      toBase: (n) => n,
      fromBase: (n) => n,
    },
    { unit: "F", toBase: (n) => ((n - 32) * 5) / 9, fromBase: (n) => (n * 9) / 5 + 32 },
    { unit: "K", toBase: (n) => n - 273.15, fromBase: (n) => n + 273.15 },
  ],
  speed: [
    { unit: "m/s", toBase: (n) => n, fromBase: (n) => n },
    { unit: "km/h", toBase: (n) => n / 3.6, fromBase: (n) => n * 3.6 },
    { unit: "mph", toBase: (n) => n * 0.44704, fromBase: (n) => n / 0.44704 },
  ],
  area: [
    { unit: "m²", toBase: (n) => n, fromBase: (n) => n },
    { unit: "km²", toBase: (n) => n * 1e6, fromBase: (n) => n / 1e6 },
    { unit: "ft²", toBase: (n) => n * 0.09290304, fromBase: (n) => n / 0.09290304 },
    { unit: "ac", toBase: (n) => n * 4046.8564224, fromBase: (n) => n / 4046.8564224 },
  ],
  volume: [
    { unit: "L", toBase: (n) => n / 1000, fromBase: (n) => n * 1000 },
    { unit: "m³", toBase: (n) => n, fromBase: (n) => n },
    { unit: "gal (US)", toBase: (n) => n * 0.003785411784, fromBase: (n) => n / 0.003785411784 },
    { unit: "fl oz (US)", toBase: (n) => n * 2.95735295625e-5, fromBase: (n) => n / 2.95735295625e-5 },
  ],
};

export default function UnitsPage() {
  const t = useTranslations("units");
  const [cat, setCat] = useState<Cat>("length");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [val, setVal] = useState("1");
  const rows = TABLES[cat];

  const converted = useMemo(() => {
    const n = parseFloat(val.replace(",", "."));
    if (Number.isNaN(n)) return "—";
    const base = rows[fromIdx]!.toBase(n);
    const out = rows[toIdx]!.fromBase(base);
    return String(Math.round(out * 1e9) / 1e9);
  }, [val, rows, fromIdx, toIdx]);

  const tabs: { k: Cat; lab: string }[] = [
    { k: "length", lab: t("length") },
    { k: "mass", lab: t("mass") },
    { k: "temp", lab: t("temp") },
    { k: "speed", lab: t("speed") },
    { k: "area", lab: t("area") },
    { k: "volume", lab: t("volume") },
  ];

  async function copyResult() {
    if (converted === "—") return;
    const line = `${converted} ${rows[toIdx]?.unit ?? ""}`.trim();
    try {
      await navigator.clipboard.writeText(line);
    } catch {
      /* ignore */
    }
  }

  function resetAndRun() {
    setCat("length");
    setFromIdx(0);
    setToIdx(1);
    setVal("1");
  }

  function swapUnits() {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
  }

  return (
    <ToolPageShell title={t("title")}>
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ k, lab }) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setCat(k);
              setFromIdx(0);
              setToIdx(1 < TABLES[k].length ? 1 : 0);
            }}
            className={`tool-chip ${cat === k ? "tool-chip-on" : "tool-chip-off"}`}
          >
            {lab}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-zinc-400">{t("from")}</span>
          <select
            className="tool-select w-full"
            value={fromIdx}
            onChange={(e) => setFromIdx(+e.target.value)}
          >
            {rows.map((r, i) => (
              <option key={r.unit} value={i}>
                {r.unit}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-zinc-400">{t("value")}</span>
          <input
            className="tool-field w-full font-mono"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-zinc-400">{t("to")}</span>
          <select
            className="tool-select w-full"
            value={toIdx}
            onChange={(e) => setToIdx(+e.target.value)}
          >
            {rows.map((r, i) => (
              <option key={r.unit} value={i}>
                {r.unit}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost text-sm" onClick={swapUnits}>
          {t("swap")}
        </button>
      </div>
      <div className="tool-pre-out text-lg font-semibold text-indigo-700 dark:text-indigo-300">
        {converted} {rows[toIdx]?.unit}
      </div>
      <ToolRunActions onRun={copyResult} onResetAndRun={resetAndRun} />
    </ToolPageShell>
  );
}
