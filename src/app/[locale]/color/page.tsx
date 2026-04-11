"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export default function ColorPage() {
  const t = useTranslations("color");
  const [hex, setHex] = useState("#4F46E5");
  const [r, setR] = useState(79);
  const [g, setG] = useState(70);
  const [b, setB] = useState(229);
  const [eyeError, setEyeError] = useState("");

  const fromHex = () => {
    const x = hexToRgb(hex);
    if (!x) return;
    setR(x.r);
    setG(x.g);
    setB(x.b);
  };

  const preview = useMemo(() => rgbToHex(r, g, b), [r, g, b]);

  async function eyeDropper() {
    setEyeError("");
    try {
      const ED = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
      if (!ED) {
        setEyeError("EyeDropper API not available in this browser.");
        return;
      }
      const e = new ED();
      const res = await e.open();
      setHex(res.sRGBHex.toUpperCase());
      const x = hexToRgb(res.sRGBHex);
      if (x) {
        setR(x.r);
        setG(x.g);
        setB(x.b);
      }
    } catch (e) {
      setEyeError(String(e));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="h-24 w-40 rounded-xl border border-zinc-700 shadow-lg"
          style={{ backgroundColor: preview }}
        />
        <button
          type="button"
          onClick={eyeDropper}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
        >
          EyeDropper
        </button>
      </div>
      {eyeError && <p className="text-sm text-amber-400">{eyeError}</p>}
      <label className="block text-sm">
        <span className="text-zinc-500">{t("hex")}</span>
        <input
          className="mt-1 w-full max-w-xs rounded border border-zinc-700 bg-zinc-900 px-2 py-2 font-mono"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          onBlur={fromHex}
        />
      </label>
      <div className="grid max-w-md grid-cols-3 gap-3 text-sm">
        {(
          [
            ["R", r, setR],
            ["G", g, setG],
            ["B", b, setB],
          ] as const
        ).map(([lab, v, set]) => (
          <label key={lab}>
            <span className="text-zinc-500">{t("rgb")} {lab}</span>
            <input
              type="number"
              min={0}
              max={255}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
              value={v}
              onChange={(e) => set(+e.target.value || 0)}
            />
          </label>
        ))}
      </div>
      <p className="font-mono text-emerald-300">{preview}</p>
    </div>
  );
}
