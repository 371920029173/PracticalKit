"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type OutKind =
  | "mp3"
  | "wav"
  | "aac"
  | "m4a"
  | "ogg"
  | "flac"
  | "opus";

export default function AudioPage() {
  const t = useTranslations("audio");
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function convert(f: File, out: OutKind) {
    setBusy(true);
    setLog("loading ffmpeg…");
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile } = await import("@ffmpeg/util");
      const ff = new FFmpeg();
      ff.on("log", ({ message }) => setLog(message));
      await ff.load();
      const nameIn = "input_audio";
      await ff.writeFile(nameIn, await fetchFile(f));

      let nameOut: string;
      let args: string[];
      let mime: string;

      switch (out) {
        case "mp3":
          nameOut = "out.mp3";
          args = ["-i", nameIn, "-codec:a", "libmp3lame", "-b:a", "192k", nameOut];
          mime = "audio/mpeg";
          break;
        case "wav":
          nameOut = "out.wav";
          args = ["-i", nameIn, nameOut];
          mime = "audio/wav";
          break;
        case "aac":
          nameOut = "out.aac";
          args = ["-i", nameIn, "-c:a", "aac", "-b:a", "192k", nameOut];
          mime = "audio/aac";
          break;
        case "m4a":
          nameOut = "out.m4a";
          args = [
            "-i",
            nameIn,
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            nameOut,
          ];
          mime = "audio/mp4";
          break;
        case "ogg":
          nameOut = "out.ogg";
          args = ["-i", nameIn, "-c:a", "libvorbis", "-q:a", "5", nameOut];
          mime = "audio/ogg";
          break;
        case "flac":
          nameOut = "out.flac";
          args = ["-i", nameIn, "-c:a", "flac", nameOut];
          mime = "audio/flac";
          break;
        case "opus":
          nameOut = "out.opus";
          args = ["-i", nameIn, "-c:a", "libopus", "-b:a", "128k", nameOut];
          mime = "audio/ogg";
          break;
        default:
          return;
      }

      await ff.exec(args);
      const data = new Uint8Array((await ff.readFile(nameOut)) as Uint8Array);
      const blob = new Blob([new Uint8Array(data)], { type: mime });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = nameOut;
      a.click();
      URL.revokeObjectURL(u);
    } catch (e) {
      setLog(String(e));
    } finally {
      setBusy(false);
    }
  }

  const buttons: { k: OutKind; lab: string }[] = [
    { k: "mp3", lab: t("fmtMp3") },
    { k: "wav", lab: t("fmtWav") },
    { k: "aac", lab: t("fmtAac") },
    { k: "m4a", lab: t("fmtM4a") },
    { k: "ogg", lab: t("fmtOgg") },
    { k: "flac", lab: t("fmtFlac") },
    { k: "opus", lab: t("fmtOpus") },
  ];

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <label className="block text-sm text-slate-700 dark:text-zinc-300">
        {t("pick")}
        <input
          type="file"
          accept="audio/*,video/*"
          disabled={busy}
          className="mt-1 block text-sm file:btn-motion file:rounded-lg file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {buttons.map(({ k, lab }) => (
          <button
            key={k}
            type="button"
            disabled={busy || !file}
            className="btn-ghost text-sm disabled:opacity-40"
            onClick={() => file && void convert(file, k)}
          >
            → {lab}
          </button>
        ))}
      </div>
      <pre className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-zinc-800 dark:bg-black/40 dark:text-zinc-400">
        {log}
      </pre>
    </div>
  );
}
