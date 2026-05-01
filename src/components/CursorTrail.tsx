"use client";

import { useEffect, useRef } from "react";

const TRAIL_COUNT = 8;

export function CursorTrail() {
  const dotsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const dots = dotsRef.current.filter(Boolean);
    if (!dots.length) return;

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    const points = Array.from({ length: dots.length }, () => ({ x: mouseX, y: mouseY }));
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const intensity = prefersReduced ? 0.2 : lowPower ? 0.45 : 0.72;
    let raf = 0;

    const onMove = (ev: PointerEvent) => {
      mouseX = ev.clientX;
      mouseY = ev.clientY;
    };

    const tick = () => {
      points[0]!.x += (mouseX - points[0]!.x) * (0.42 * intensity);
      points[0]!.y += (mouseY - points[0]!.y) * (0.42 * intensity);

      for (let i = 1; i < points.length; i++) {
        points[i]!.x += (points[i - 1]!.x - points[i]!.x) * (0.3 * intensity);
        points[i]!.y += (points[i - 1]!.y - points[i]!.y) * (0.3 * intensity);
      }

      dots.forEach((dot, i) => {
        const p = points[i]!;
        const scale = 1 - i / (dots.length + 2);
        dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${scale})`;
        dot.style.opacity = `${Math.max(0.08, 0.5 - i * 0.05)}`;
      });

      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden lg:block">
      {Array.from({ length: TRAIL_COUNT }).map((_, idx) => (
        <span
          key={idx}
          ref={(el) => {
            if (el) dotsRef.current[idx] = el;
          }}
          className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-indigo-400/80 to-violet-400/70"
        />
      ))}
    </div>
  );
}
