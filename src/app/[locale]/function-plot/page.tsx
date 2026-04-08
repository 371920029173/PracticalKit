"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { create, all } from "mathjs";

const math = create(all, {});

export default function FunctionPlotPage() {
  const t = useTranslations("functionPlotPage");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expr, setExpr] = useState("sin(x)");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-2);
  const [yMax, setYMax] = useState(2);
  const [err, setErr] = useState("");

  function draw() {
    setErr("");
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (!(xMin < xMax && yMin < yMax)) {
      setErr(t("invalid"));
      return;
    }
    const w = c.width;
    const h = c.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    const tx = (x: number) => ((x - xMin) / (xMax - xMin)) * w;
    const ty = (y: number) => h - ((y - yMin) / (yMax - yMin)) * h;

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (xMin <= 0 && 0 <= xMax) {
      const xx = tx(0);
      ctx.moveTo(xx, 0);
      ctx.lineTo(xx, h);
    }
    if (yMin <= 0 && 0 <= yMax) {
      const yy = ty(0);
      ctx.moveTo(0, yy);
      ctx.lineTo(w, yy);
    }
    ctx.stroke();

    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    try {
      for (let i = 0; i <= w; i++) {
        const x = xMin + (i / w) * (xMax - xMin);
        const y = Number(math.evaluate(expr, { x }));
        if (!Number.isFinite(y)) {
          started = false;
          continue;
        }
        const px = i;
        const py = ty(y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    } catch {
      setErr(t("invalid"));
    }
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder={t("expr")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        <input
          type="number"
          value={xMin}
          onChange={(e) => setXMin(Number(e.target.value))}
          placeholder={t("xMin")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        <input
          type="number"
          value={xMax}
          onChange={(e) => setXMax(Number(e.target.value))}
          placeholder={t("xMax")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        <input
          type="number"
          value={yMin}
          onChange={(e) => setYMin(Number(e.target.value))}
          placeholder={t("yMin")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        <input
          type="number"
          value={yMax}
          onChange={(e) => setYMax(Number(e.target.value))}
          placeholder={t("yMax")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <button type="button" className="btn-primary" onClick={draw}>
        {t("plot")}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
        <canvas ref={canvasRef} width={900} height={420} className="w-full" />
      </div>
    </div>
  );
}
