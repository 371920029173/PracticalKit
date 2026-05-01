"use client";

import { useEffect, useRef } from "react";

const TRAIL_COUNT = 14;
const SPARK_COUNT = 8;

export function CursorTrail() {
  const dotsRef = useRef<HTMLSpanElement[]>([]);
  const sparksRef = useRef<HTMLSpanElement[]>([]);
  const coreRef = useRef<HTMLSpanElement | null>(null);
  const haloRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const dots = dotsRef.current.filter(Boolean);
    const sparks = sparksRef.current.filter(Boolean);
    const core = coreRef.current;
    const halo = haloRef.current;
    if (!dots.length || !core || !halo) return;

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    const points = Array.from({ length: dots.length }, () => ({ x: mouseX, y: mouseY }));
    const sparkAngles = Array.from({ length: sparks.length }, (_, i) => (Math.PI * 2 * i) / Math.max(1, sparks.length));
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const intensity = prefersReduced ? 0.25 : lowPower ? 0.6 : 1;
    let raf = 0;
    let lastX = mouseX;
    let lastY = mouseY;
    let pulse = 0;
    let hoverBoost = 0;

    const onMove = (ev: PointerEvent) => {
      mouseX = ev.clientX;
      mouseY = ev.clientY;
    };

    const onDown = () => {
      hoverBoost = 1;
    };

    const onUp = () => {
      hoverBoost = 0;
    };

    const tick = () => {
      const dx = mouseX - lastX;
      const dy = mouseY - lastY;
      const speed = Math.min(28, Math.hypot(dx, dy));
      lastX = mouseX;
      lastY = mouseY;
      pulse += 0.12 + speed * 0.002;

      points[0]!.x += (mouseX - points[0]!.x) * (0.5 * intensity);
      points[0]!.y += (mouseY - points[0]!.y) * (0.5 * intensity);

      for (let i = 1; i < points.length; i++) {
        points[i]!.x += (points[i - 1]!.x - points[i]!.x) * (0.36 * intensity);
        points[i]!.y += (points[i - 1]!.y - points[i]!.y) * (0.36 * intensity);
      }

      dots.forEach((dot, i) => {
        const p = points[i]!;
        const scale = 1 - i / (dots.length + 2);
        const wobble = Math.sin(pulse + i * 0.65) * 2.2 * intensity;
        dot.style.transform = `translate3d(${p.x + wobble}px, ${p.y - wobble * 0.5}px, 0) scale(${scale})`;
        dot.style.opacity = `${Math.max(0.06, 0.58 - i * 0.04)}`;
      });

      const coreScale = 1 + speed * 0.02 + hoverBoost * 0.2;
      core.style.transform = `translate3d(${points[0]!.x}px, ${points[0]!.y}px, 0) scale(${coreScale})`;
      core.style.opacity = `${0.8 + Math.min(0.2, speed * 0.02)}`;

      const haloScale = 1 + speed * 0.035 + hoverBoost * 0.35;
      const haloRot = pulse * 12;
      halo.style.transform = `translate3d(${points[0]!.x}px, ${points[0]!.y}px, 0) scale(${haloScale}) rotate(${haloRot}deg)`;
      halo.style.opacity = `${Math.max(0.25, 0.55 - speed * 0.01)}`;

      sparks.forEach((spark, i) => {
        const r = 10 + (speed * 0.8 + 8 * hoverBoost) * (1 + (i % 3) * 0.15);
        const a = sparkAngles[i]! + pulse * (0.06 + i * 0.004);
        const sx = points[0]!.x + Math.cos(a) * r;
        const sy = points[0]!.y + Math.sin(a) * r;
        spark.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${0.7 + ((i % 4) * 0.08)})`;
        spark.style.opacity = `${Math.max(0.08, 0.42 - i * 0.03)}`;
      });

      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden md:block">
      <span
        ref={coreRef}
        className="absolute left-0 top-0 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300 shadow-[0_0_16px_rgba(129,140,248,0.95)]"
      />
      <span
        ref={haloRef}
        className="absolute left-0 top-0 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-300/70 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-[0.4px]"
      />
      {Array.from({ length: TRAIL_COUNT }).map((_, idx) => (
        <span
          key={idx}
          ref={(el) => {
            if (el) dotsRef.current[idx] = el;
          }}
          className="absolute left-0 top-0 h-2 w-2 rounded-full bg-gradient-to-br from-indigo-400/90 to-violet-400/70 blur-[0.5px]"
        />
      ))}
      {Array.from({ length: SPARK_COUNT }).map((_, idx) => (
        <span
          key={`spark-${idx}`}
          ref={(el) => {
            if (el) sparksRef.current[idx] = el;
          }}
          className="absolute left-0 top-0 h-[3px] w-[3px] rounded-full bg-cyan-200/90 shadow-[0_0_8px_rgba(125,211,252,0.9)]"
        />
      ))}
    </div>
  );
}
