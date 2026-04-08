"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Algo = "SHA-256" | "SHA-384" | "SHA-512";

async function digest(algo: Algo, data: BufferSource): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashPage() {
  const t = useTranslations("hashPage");
  const tc = useTranslations("common");
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  async function runText() {
    setBusy(true);
    setOut("");
    try {
      const data = new TextEncoder().encode(text);
      setOut(await digest(algo, data));
    } catch {
      setOut(t("empty"));
    } finally {
      setBusy(false);
    }
  }

  async function runFile(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setOut("");
    try {
      const buf = await f.arrayBuffer();
      setOut(await digest(algo, buf));
    } catch {
      setOut(t("empty"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <label className="flex flex-wrap items-center gap-2 text-sm">
        <span>{t("algo")}</span>
        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value as Algo)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
        >
          <option>SHA-256</option>
          <option>SHA-384</option>
          <option>SHA-512</option>
        </select>
      </label>
      <textarea
        className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("textIn")}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className="btn-primary" onClick={() => void runText()}>
          {t("run")}
        </button>
        <label className="btn-ghost cursor-pointer text-sm">
          {t("fileIn")}
          <input
            type="file"
            className="hidden"
            onChange={(e) => void runFile(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => {
            void navigator.clipboard.writeText(out);
          }}
        >
          {tc("copy")}
        </button>
      </div>
      <pre className="break-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {out || "—"}
      </pre>
      <p className="text-xs text-slate-500">{t("digest")}</p>
    </div>
  );
}
