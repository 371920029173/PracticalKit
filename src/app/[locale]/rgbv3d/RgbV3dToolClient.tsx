"use client";

import {
  PROFILE_LOSSLESS_VECTOR_V2,
  decodeRgbV3d,
  encodeRgbLossless,
} from "@rgbv3d/core";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

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

function rgbToCanvas(
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

function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(data)], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RgbV3dToolClient() {
  const t = useTranslations("rgbv3d");
  const tc = useTranslations("common");
  const [dirBits, setDirBits] = useState<8 | 9>(8);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    name: string;
    rawBytes: number;
    outBytes: number;
  } | null>(null);
  const [lastBlob, setLastBlob] = useState<Uint8Array | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const onEncodeFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setError(null);
      setStats(null);
      setLastBlob(null);
      clearPreviewCanvas();
      setBusy(true);
      try {
        const { width, height, rgb } = await rasterFileToRgb(file);
        const rawBytes = width * height * 3;
        const out = encodeRgbLossless({
          width,
          height,
          rgb,
          profile: PROFILE_LOSSLESS_VECTOR_V2,
          dirBits,
        });
        const base = file.name.replace(/\.[^/.]+$/, "") || "image";
        setLastBlob(out);
        setStats({
          name: `${base}.rgbv3d`,
          rawBytes,
          outBytes: out.length,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorLoad"));
      } finally {
        setBusy(false);
      }
    },
    [dirBits, t]
  );

  function clearPreviewCanvas() {
    const c = previewRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
  }

  const onDecodeFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setError(null);
      setBusy(true);
      try {
        const buf = new Uint8Array(await file.arrayBuffer());
        const dec = decodeRgbV3d(buf);
        const c = previewRef.current;
        if (c) rgbToCanvas(c, dec.rgb, dec.width, dec.height);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorDecode"));
        clearPreviewCanvas();
      } finally {
        setBusy(false);
      }
    },
    [t]
  );

  return (
    <div className="space-y-8">
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <h1 className="text-slate-900 dark:text-white">{t("title")}</h1>
        <p>{t("encodeLead")}</p>
        <p className="text-sm text-slate-500 dark:text-zinc-500">
          {t("encodeOnly")}
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("encodeSection")}
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-2 text-sm">
            <span className="text-slate-600 dark:text-zinc-400">
              {t("pickFile")}
            </span>
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              className="text-sm file:btn-motion file:mr-2 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white"
              onChange={(e) => void onEncodeFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-slate-600 dark:text-zinc-400">
              {t("dirBits")}
            </span>
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              value={dirBits}
              disabled={busy}
              onChange={(e) =>
                setDirBits(Number(e.target.value) === 9 ? 9 : 8)
              }
            >
              <option value={8}>{t("dirBits8")}</option>
              <option value={9}>{t("dirBits9")}</option>
            </select>
          </label>
          <button
            type="button"
            disabled={busy || !lastBlob || !stats}
            className="btn-primary disabled:opacity-40"
            onClick={() => {
              if (lastBlob && stats) downloadBlob(lastBlob, stats.name);
            }}
          >
            {tc("download")}
          </button>
        </div>
        {stats && !error && (
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {t("bytes")}: {stats.rawBytes} → {stats.outBytes} (
            {((100 * stats.outBytes) / stats.rawBytes).toFixed(2)}%{" "}
            {t("ofRaw")})
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("browseSection")}
        </h2>
        <p className="text-sm text-slate-600 dark:text-zinc-400">{t("browseLead")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm">
            <span className="mr-2 text-slate-600 dark:text-zinc-400">
              {t("pickRgbv3d")}
            </span>
            <input
              type="file"
              accept=".rgbv3d,application/octet-stream"
              disabled={busy}
              className="text-sm file:btn-motion file:rounded-lg file:bg-slate-800 file:px-3 file:py-1.5 file:text-white dark:file:bg-zinc-700"
              onChange={(e) => void onDecodeFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => {
              clearPreviewCanvas();
              setError(null);
            }}
          >
            {t("clearPreview")}
          </button>
        </div>
        <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-2 dark:border-zinc-700 dark:bg-zinc-950">
          <canvas
            ref={previewRef}
            className="max-h-[min(70vh,560px)] max-w-full object-contain"
          />
        </div>
      </section>

      {busy && (
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {tc("processing")}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-sm text-slate-500 dark:text-zinc-500">
        {t("downloadCli")}
      </p>
    </div>
  );
}
