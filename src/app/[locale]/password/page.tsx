"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = LOWER.toUpperCase();
const NUM = "0123456789";
const SYM = "!@#$%^&*-_=+";

function randomChar(pool: string) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return pool[arr[0]! % pool.length]!;
}

function generatePassword(length: number, useSymbols: boolean) {
  let pool = LOWER + UPPER + NUM;
  if (useSymbols) pool += SYM;
  let s = "";
  for (let i = 0; i < length; i++) s += randomChar(pool);
  return s;
}

function passwordScore(v: string) {
  let score = 0;
  if (v.length >= 12) score += 1;
  if (v.length >= 20) score += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^a-zA-Z0-9]/.test(v)) score += 1;
  return Math.min(score, 5);
}

export default function PasswordPage() {
  const t = useTranslations("password");
  const tc = useTranslations("common");
  const [len, setLen] = useState(20);
  const [symbols, setSymbols] = useState(true);
  const [out, setOut] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  function gen() {
    setOut(generatePassword(len, symbols));
  }

  function resetAndRun() {
    setLen(20);
    setSymbols(true);
    setOut(generatePassword(20, true));
    setCopyStatus("");
  }

  async function copyOut() {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
  }

  const score = passwordScore(out);
  const scoreLabel =
    score <= 1 ? "Weak" : score <= 3 ? "Medium" : score === 4 ? "Strong" : "Very strong";

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <label className="flex items-center gap-3 text-sm">
        <span className="text-zinc-400">{t("len")}</span>
        <input
          type="number"
          min={8}
          max={128}
          className="w-24 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1"
          value={len}
          onChange={(e) => setLen(+e.target.value || 8)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={symbols}
          onChange={(e) => setSymbols(e.target.checked)}
        />
        {t("symbols")}
      </label>
      <ToolRunActions onRun={gen} onResetAndRun={resetAndRun} />
      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded bg-zinc-800">
          <div
            className={`h-full transition-all ${
              score <= 1 ? "bg-red-500" : score <= 3 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <span>Strength: {out ? scoreLabel : "—"}</span>
          <button type="button" className="btn-ghost text-xs" onClick={() => void copyOut()}>
            {tc("copy")}
          </button>
        </div>
        {copyStatus ? <p className="text-xs text-zinc-500">{copyStatus}</p> : null}
      </div>
      <pre className="rounded-lg border border-zinc-800 bg-black/40 p-3 font-mono text-sm text-emerald-300">
        {out || "—"}
      </pre>
    </div>
  );
}
