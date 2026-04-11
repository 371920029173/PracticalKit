"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { create, all } from "mathjs";

const math = create(all, {});

const DEF_EXPR = "sin(x)";
const DEF_X0 = -10;
const DEF_X1 = 10;
const DEF_Y0 = -2;
const DEF_Y1 = 2;

export default function FunctionPlotPage() {
  const t = useTranslations("functionPlotPage");
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expr, setExpr] = useState(DEF_EXPR);
  const [xMin, setXMin] = useState(DEF_X0);
  const [xMax, setXMax] = useState(DEF_X1);
  const [yMin, setYMin] = useState(DEF_Y0);
  const [yMax, setYMax] = useState(DEF_Y1);
  const [err, setErr] = useState("");

  const drawImpl = useCallback(
    (
      e: string,
      xa: number,
      xb: number,
      ya: number,
      yb: number,
      canvas: HTMLCanvasElement | null
    ) => {
      setErr("");
      const c = canvas;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      if (!(xa < xb && ya < yb)) {
        setErr(t("invalid"));
        return;
      }
      const w = c.width;
      const h = c.height;
      const dark =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = dark ? "#18181b" : "#f8fafc";
      ctx.fillRect(0, 0, w, h);

      const tx = (x: number) => ((x - xa) / (xb - xa)) * w;
      const ty = (y: number) => h - ((y - ya) / (yb - ya)) * h;

      ctx.strokeStyle = dark ? "#52525b" : "#94a3b8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (xa <= 0 && 0 <= xb) {
        const xx = tx(0);
        ctx.moveTo(xx, 0);
        ctx.lineTo(xx, h);
      }
      if (ya <= 0 && 0 <= yb) {
        const yy = ty(0);
        ctx.moveTo(0, yy);
        ctx.lineTo(w, yy);
      }
      ctx.stroke();

      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      try {
        for (let i = 0; i <= w; i++) {
          const x = xa + (i / w) * (xb - xa);
          const y = Number(math.evaluate(e, { x }));
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
    },
    [t]
  );

  const draw = useCallback(() => {
    drawImpl(expr, xMin, xMax, yMin, yMax, canvasRef.current);
  }, [drawImpl, expr, xMax, xMin, yMax, yMin]);

  const resetAndRun = useCallback(() => {
    setExpr(DEF_EXPR);
    setXMin(DEF_X0);
    setXMax(DEF_X1);
    setYMin(DEF_Y0);
    setYMax(DEF_Y1);
    queueMicrotask(() =>
      drawImpl(DEF_EXPR, DEF_X0, DEF_X1, DEF_Y0, DEF_Y1, canvasRef.current)
    );
  }, [drawImpl]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw, theme]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder={t("expr")}
          className="tool-field font-mono sm:col-span-2 lg:col-span-1"
        />
        <input
          type="number"
          value={xMin}
          onChange={(e) => setXMin(Number(e.target.value))}
          placeholder={t("xMin")}
          className="tool-field"
        />
        <input
          type="number"
          value={xMax}
          onChange={(e) => setXMax(Number(e.target.value))}
          placeholder={t("xMax")}
          className="tool-field"
        />
        <input
          type="number"
          value={yMin}
          onChange={(e) => setYMin(Number(e.target.value))}
          placeholder={t("yMin")}
          className="tool-field"
        />
        <input
          type="number"
          value={yMax}
          onChange={(e) => setYMax(Number(e.target.value))}
          placeholder={t("yMax")}
          className="tool-field"
        />
      </div>
      <ToolRunActions onRun={draw} onResetAndRun={resetAndRun} runLabel={t("plot")} />
      {err && (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      )}
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
        <canvas ref={canvasRef} width={900} height={420} className="w-full max-w-full" />
      </div>
    </div>
  );
}
