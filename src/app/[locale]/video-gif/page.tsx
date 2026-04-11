"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";

type OutFmt = "gif" | "mp4" | "webm";

export default function VideoGifPage() {
  const t = useTranslations("videoGif");
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);
  const [fmt, setFmt] = useState<OutFmt>("gif");
  const [videoFile, setVideoFile] = useState<File | undefined>();

  async function run(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setLog("loading ffmpeg…");
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile } = await import("@ffmpeg/util");
      const ff = new FFmpeg();
      ff.on("log", ({ message }) => setLog(message));
      await ff.load();
      const name = file.name.replace(/[^\w.]+/g, "_");
      await ff.writeFile(name, await fetchFile(file));

      if (fmt === "gif") {
        await ff.exec([
          "-i",
          name,
          "-t",
          "8",
          "-vf",
          "fps=10,scale=480:-1:flags=lanczos",
          "out.gif",
        ]);
        const data = new Uint8Array((await ff.readFile("out.gif")) as Uint8Array);
        const blob = new Blob([data], { type: "image/gif" });
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u;
        a.download = "clip.gif";
        a.click();
        URL.revokeObjectURL(u);
        setLog("saved clip.gif (max 8s)");
        return;
      }

      if (fmt === "mp4") {
        await ff.exec([
          "-i",
          name,
          "-t",
          "120",
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "23",
          "-movflags",
          "+faststart",
          "-pix_fmt",
          "yuv420p",
          "out.mp4",
        ]);
        const data = new Uint8Array((await ff.readFile("out.mp4")) as Uint8Array);
        const blob = new Blob([data], { type: "video/mp4" });
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u;
        a.download = "clip.mp4";
        a.click();
        URL.revokeObjectURL(u);
        setLog("saved clip.mp4");
        return;
      }

      await ff.exec([
        "-i",
        name,
        "-t",
        "120",
        "-c:v",
        "libvpx-vp9",
        "-crf",
        "32",
        "-b:v",
        "0",
        "-an",
        "out.webm",
      ]);
      const data = new Uint8Array((await ff.readFile("out.webm")) as Uint8Array);
      const blob = new Blob([data], { type: "video/webm" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = "clip.webm";
      a.click();
      URL.revokeObjectURL(u);
      setLog("saved clip.webm");
    } catch (e) {
      setLog(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-700 dark:text-zinc-300">
          {t("outputLabel")}
          <select
            value={fmt}
            onChange={(e) => setFmt(e.target.value as OutFmt)}
            disabled={busy}
            className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="gif">{t("fmtGif")}</option>
            <option value="mp4">{t("fmtMp4")}</option>
            <option value="webm">{t("fmtWebm")}</option>
          </select>
        </label>
      </div>
      <input
        type="file"
        accept="video/*"
        disabled={busy}
        className="text-sm file:btn-motion file:rounded-lg file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white"
        onChange={(e) => setVideoFile(e.target.files?.[0])}
      />
      <ToolRunActions
        onRun={() => run(videoFile)}
        onResetAndRun={() => {
          setVideoFile(undefined);
          setLog("");
          setFmt("gif");
        }}
        busy={busy}
      />
      <pre className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 dark:border-zinc-800 dark:bg-black/40 dark:text-zinc-400">
        {log}
      </pre>
    </div>
  );
}
