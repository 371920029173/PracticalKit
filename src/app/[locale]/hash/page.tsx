"use client";

import { ToolPageShell, ToolSection, ToolOutput } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

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
  const [verify, setVerify] = useState("");
  const [upper, setUpper] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileMeta, setFileMeta] = useState("");

  const displayOut = upper ? out.toUpperCase() : out;

  const verifyResult = useMemo(() => {
    if (!out || !verify.trim()) return null;
    const a = out.toLowerCase();
    const b = verify.trim().toLowerCase().replace(/^0x/, "");
    if (a === b) return "match";
    return "nomatch";
  }, [out, verify]);

  const runText = useCallback(async () => {
    setBusy(true);
    setOut("");
    setFileMeta("");
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
    setVerify("");
    setBusy(true);
    setOut("");
    setFileMeta("");
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
    setText("");
    try {
      const buf = await f.arrayBuffer();
      setOut(await digest(algo, buf));
      setFileMeta(`${f.name} · ${(f.size / 1024).toFixed(1)} KB`);
    } catch {
      setOut(t("empty"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection title={t("algo")}>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algo)}
            className="tool-select w-auto"
          >
            <option>SHA-256</option>
            <option>SHA-384</option>
            <option>SHA-512</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
            <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
            {t("uppercase")}
          </label>
          <span className="text-xs text-slate-500 dark:text-zinc-500">
            {t("charCount", { count: text.length })}
          </span>
        </div>
      </ToolSection>

      <ToolSection title={t("textIn")}>
        <textarea
          className="tool-textarea min-h-28"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("textIn")}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <ToolRunActions onRun={runText} onResetAndRun={resetAndRun} busy={busy} runLabel={t("run")} />
          <label className="btn-ghost cursor-pointer text-sm">
            {t("fileIn")}
            <input type="file" className="hidden" onChange={(e) => void runFile(e.target.files?.[0])} />
          </label>
          {fileMeta ? <span className="self-center text-xs text-slate-500">{fileMeta}</span> : null}
        </div>
      </ToolSection>

      <ToolOutput label={t("digest")}>
        {displayOut || "—"}
      </ToolOutput>

      {displayOut ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost text-sm" onClick={() => void navigator.clipboard.writeText(displayOut)}>
            {tc("copy")}
          </button>
        </div>
      ) : null}

      <ToolSection title={t("verifyTitle")} description={t("verifyNote")}>
        <input
          className="tool-field w-full font-mono"
          value={verify}
          onChange={(e) => setVerify(e.target.value)}
          placeholder={t("verifyPlaceholder")}
        />
        {verifyResult === "match" ? (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{t("verifyMatch")}</p>
        ) : null}
        {verifyResult === "nomatch" ? (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{t("verifyNoMatch")}</p>
        ) : null}
      </ToolSection>
    </ToolPageShell>
  );
}
