"use client";

import {
  PROFILE_LOSSLESS_VECTOR_V2,
  decodeRgbV3d,
  encodeRgbLossless,
} from "@rgbv3d/core";
import { useState } from "react";
import { useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";
import { createWorker } from "tesseract.js";

type RasterMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif";

const RASTER_OPTIONS: { mime: RasterMime | "rgbv3d"; label: string }[] = [
  { mime: "image/png", label: "PNG" },
  { mime: "image/jpeg", label: "JPEG" },
  { mime: "image/webp", label: "WebP" },
  { mime: "image/avif", label: "AVIF" },
  { mime: "rgbv3d", label: "RGBV3D (.rgbv3d)" },
];

async function rasterFileToRgb(
  file: File
): Promise<{ width: number; height: number; rgb: Uint8Array }> {
  const bitmap = await createImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const rgba = ctx.getImageData(0, 0, w, h).data;
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i]!;
    rgb[j + 1] = rgba[i + 1]!;
    rgb[j + 2] = rgba[i + 2]!;
  }
  return { width: w, height: h, rgb };
}

async function loadRgbFromFile(file: File): Promise<{
  width: number;
  height: number;
  rgb: Uint8Array;
}> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".rgbv3d")) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const d = decodeRgbV3d(buf);
    return { width: d.width, height: d.height, rgb: d.rgb };
  }
  return rasterFileToRgb(file);
}

function putRgbOnCanvas(
  canvas: HTMLCanvasElement,
  rgb: Uint8Array,
  width: number,
  height: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = width;
  canvas.height = height;
  const img = ctx.createImageData(width, height);
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    img.data[j] = rgb[i]!;
    img.data[j + 1] = rgb[i + 1]!;
    img.data[j + 2] = rgb[i + 2]!;
    img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function downloadBlobPart(blob: Blob, filename: string) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(u);
}

export default function ImagePage() {
  const t = useTranslations("image");
  const [busy, setBusy] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [fmt, setFmt] = useState<RasterMime | "rgbv3d">("image/jpeg");

  async function compress(file: File) {
    setBusy("compress");
    try {
      const blob = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      downloadBlobPart(blob, file.name.replace(/\.[^.]+$/, "") + ".compressed.jpg");
    } finally {
      setBusy("");
    }
  }

  async function convert(file: File, kind: RasterMime | "rgbv3d") {
    setBusy("convert");
    try {
      const { width, height, rgb } = await loadRgbFromFile(file);
      const base = file.name.replace(/\.[^/.]+$/, "") || "image";

      if (kind === "rgbv3d") {
        const out = encodeRgbLossless({
          width,
          height,
          rgb,
          profile: PROFILE_LOSSLESS_VECTOR_V2,
          dirBits: 8,
        });
        downloadBlobPart(
          new Blob([new Uint8Array(out)], { type: "application/octet-stream" }),
          `${base}.rgbv3d`
        );
        return;
      }

      const canvas = document.createElement("canvas");
      putRgbOnCanvas(canvas, rgb, width, height);

      const quality =
        kind === "image/jpeg"
          ? 0.92
          : kind === "image/webp"
            ? 0.92
            : kind === "image/avif"
              ? 0.55
              : undefined;

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), kind, quality)
      );
      if (!blob) {
        alert(
          kind === "image/avif"
            ? "AVIF export not supported in this browser. Try PNG or WebP."
            : "Could not encode this format."
        );
        return;
      }
      const ext =
        kind === "image/jpeg"
          ? "jpg"
          : kind === "image/png"
            ? "png"
            : kind === "image/webp"
              ? "webp"
              : "avif";
      downloadBlobPart(blob, `${base}.${ext}`);
    } finally {
      setBusy("");
    }
  }

  async function ocrFile(file: File) {
    setBusy("ocr");
    setOcrText("");
    try {
      const w = await createWorker("eng");
      const {
        data: { text },
      } = await w.recognize(file);
      await w.terminate();
      setOcrText(text);
    } catch (e) {
      setOcrText(String(e));
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      {busy && (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {busy}…
        </p>
      )}
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          {t("compress")}
        </h2>
        <input
          type="file"
          accept="image/*"
          className="text-sm file:btn-motion file:mr-2 file:rounded-lg file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) compress(f);
          }}
        />
      </section>
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          {t("convert")}
        </h2>
        <p className="text-xs text-slate-600 dark:text-zinc-500">
          {t("convertHint")}
        </p>
        <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-zinc-300">
          <span>{t("targetFormat")}</span>
          <select
            value={fmt}
            onChange={(e) => setFmt(e.target.value as RasterMime | "rgbv3d")}
            className="max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {RASTER_OPTIONS.map(({ mime, label }) => (
              <option key={mime} value={mime}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <input
          type="file"
          accept="image/*,.rgbv3d"
          className="text-sm file:btn-motion file:rounded-lg file:bg-slate-800 file:px-3 file:py-1.5 file:text-white dark:file:bg-zinc-700"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) convert(f, fmt);
          }}
        />
      </section>
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          {t("ocr")}
        </h2>
        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) ocrFile(f);
          }}
        />
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 dark:border-zinc-800 dark:bg-black/40 dark:text-zinc-300">
          {ocrText}
        </pre>
      </section>
    </div>
  );
}
