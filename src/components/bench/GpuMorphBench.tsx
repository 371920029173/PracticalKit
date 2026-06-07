"use client";

import { useEffect, useRef } from "react";

export type GpuBenchResult = { score: number; ms: number; detail: string; fps: number };

type GlBundle = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  count: number;
  uTime: WebGLUniformLocation;
  uRot: WebGLUniformLocation;
  uRes: WebGLUniformLocation;
};

const VS = `
attribute vec3 aPos;
uniform float uTime;
uniform vec2 uRot;
uniform vec2 uRes;
varying vec3 vPos;
varying float vHue;
void main(){
  float wobble = sin(aPos.x * 7.0 + uTime * 2.2) * 0.14
               + cos(aPos.y * 5.0 + uTime * 1.7) * 0.12
               + sin(aPos.z * 6.0 + uTime * 2.9) * 0.1;
  vec3 p = aPos * (1.0 + wobble);
  float cx = cos(uRot.y), sx = sin(uRot.y);
  float cz = cos(uRot.x), sz = sin(uRot.x);
  vec3 r = vec3(p.x * cz - p.y * sz, p.x * sz + p.y * cz, p.z);
  r = vec3(r.x, r.y * cx - r.z * sx, r.y * sx + r.z * cx);
  vPos = r;
  vHue = fract(aPos.x * 0.17 + aPos.y * 0.23 + aPos.z * 0.31 + uTime * 0.08);
  gl_Position = vec4(r.xy * 0.72, r.z * 0.35 + 2.8, 3.2);
}
`;

const FS = `
precision mediump float;
varying vec3 vPos;
varying float vHue;
void main(){
  vec3 n = normalize(vPos);
  float rim = pow(1.0 - abs(n.z), 2.2);
  vec3 base = 0.5 + 0.5 * cos(6.2831 * (vec3(vHue, vHue + 0.33, vHue + 0.66)));
  vec3 col = base * (0.55 + rim * 0.85);
  gl_FragColor = vec4(col, 1.0);
}
`;

function buildMesh(): Float32Array {
  const pts: number[] = [];
  const rings = 36;
  const segments = 48;
  for (let i = 0; i <= rings; i++) {
    const v = (i / rings) * Math.PI;
    const sv = Math.sin(v);
    const cv = Math.cos(v);
    for (let j = 0; j <= segments; j++) {
      const u = (j / segments) * Math.PI * 2;
      const su = Math.sin(u);
      const cu = Math.cos(u);
      const r = 0.55 + Math.sin(u * 3 + v * 4) * 0.18 + Math.cos(v * 5) * 0.12;
      pts.push(r * sv * cu, r * cv, r * sv * su);
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const out = new Float32Array(idx.length * 3);
  for (let k = 0; k < idx.length; k++) {
    const p = idx[k]! * 3;
    out[k * 3] = pts[p]!;
    out[k * 3 + 1] = pts[p + 1]!;
    out[k * 3 + 2] = pts[p + 2]!;
  }
  return out;
}

function initGl(canvas: HTMLCanvasElement): GlBundle | null {
  const gl = canvas.getContext("webgl", {
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, VS);
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, FS);
  gl.compileShader(fs);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  const data = buildMesh();
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

  return {
    gl,
    program,
    count: data.length / 3,
    uTime: gl.getUniformLocation(program, "uTime")!,
    uRot: gl.getUniformLocation(program, "uRot")!,
    uRes: gl.getUniformLocation(program, "uRes")!,
  };
}

function drawFrame(bundle: GlBundle, w: number, h: number, t: number, rotX: number, rotY: number) {
  const { gl, program, count, uTime, uRot, uRes } = bundle;
  gl.viewport(0, 0, w, h);
  gl.clearColor(0.02, 0.02, 0.04, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform1f(uTime, t);
  gl.uniform2f(uRot, rotX, rotY);
  gl.uniform2f(uRes, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, count);
}

export function runGpuBench(
  canvas: HTMLCanvasElement,
  durationMs = 3200,
  cancelled?: () => boolean,
): Promise<GpuBenchResult> {
  return new Promise((resolve) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 640;
    const h = canvas.clientHeight || 360;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    const bundle = initGl(canvas);
    if (!bundle) {
      resolve({ score: 0, ms: 0, detail: "WebGL", fps: 0 });
      return;
    }

    const start = performance.now();
    let frames = 0;

    const tick = (now: number) => {
      if (cancelled?.()) {
        resolve({ score: 0, ms: Math.round(now - start), detail: "cancel", fps: 0 });
        return;
      }
      const elapsed = now - start;
      const t = elapsed / 1000;
      drawFrame(bundle, canvas.width, canvas.height, t, t * 0.9, t * 1.35);
      frames++;
      if (elapsed >= durationMs) {
        const fps = Math.round((frames / elapsed) * 1000);
        const score = Math.min(100, Math.round(fps * 1.15));
        resolve({ score, ms: Math.round(elapsed), detail: `${fps} fps`, fps });
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

type GpuMorphBenchProps = {
  running?: boolean;
  idleSpin?: boolean;
  onComplete?: (result: GpuBenchResult) => void;
  fpsLabel?: string;
  className?: string;
};

export function GpuMorphBench({
  running = false,
  idleSpin = true,
  onComplete,
  fpsLabel,
  className = "",
}: GpuMorphBenchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const bundle = initGl(canvas);
    if (!bundle) return;

    let cancelled = false;

    if (running) {
      void runGpuBench(canvas, 3200, () => cancelled).then((r) => {
        if (!cancelled) onComplete?.(r);
      });
      return () => {
        cancelled = true;
        ro.disconnect();
      };
    }

    if (!idleSpin) {
      return () => ro.disconnect();
    }

    const spin = (now: number) => {
      if (cancelled) return;
      drawFrame(bundle, canvas.width, canvas.height, now / 1000, now / 1400, now / 900);
      rafRef.current = requestAnimationFrame(spin);
    };
    rafRef.current = requestAnimationFrame(spin);

    return () => {
      cancelled = true;
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [running, idleSpin, onComplete]);

  return (
    <div className={`gpu-bench-wrap ${className}`.trim()}>
      <canvas ref={canvasRef} className="gpu-bench-canvas" />
      {fpsLabel ? (
        <div className="gpu-bench-overlay">
          <span className="gpu-bench-fps">{fpsLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
