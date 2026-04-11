"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

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

  const runText = useCallback(async () => {
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
  }, [algo, text, t]);

  const resetAndRun = useCallback(async () => {
    const sample = t("sampleText");
    setAlgo("SHA-256");
    setText(sample);
    setBusy(true);
    setOut("");
    try {
      const data = new TextEncoder().encode(sample);
      setOut(await digest("SHA-256", data));
    } catch {
      setOut(t("empty"));
    } finally {
      setBusy(false);
    }
  }, [t]);

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
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <label className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-700 dark:text-zinc-300">{t("algo")}</span>
        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value as Algo)}
          className="tool-select w-auto"
        >
          <option>SHA-256</option>
          <option>SHA-384</option>
          <option>SHA-512</option>
        </select>
      </label>
      <textarea
        className="tool-textarea min-h-28"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("textIn")}
      />
      <div className="flex flex-wrap gap-2">
        <ToolRunActions
          onRun={runText}
          onResetAndRun={resetAndRun}
          busy={busy}
          runLabel={t("run")}
        />
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
      <pre className="tool-pre-out break-all font-mono text-sm">{out || "—"}</pre>
      <p className="text-xs text-slate-500 dark:text-zinc-500">{t("digest")}</p>
    </div>
  );
}
