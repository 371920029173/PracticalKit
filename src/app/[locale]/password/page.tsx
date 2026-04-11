"use client";

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

export default function PasswordPage() {
  const t = useTranslations("password");
  const [len, setLen] = useState(20);
  const [symbols, setSymbols] = useState(true);
  const [out, setOut] = useState("");

  function gen() {
    let pool = LOWER + UPPER + NUM;
    if (symbols) pool += SYM;
    let s = "";
    for (let i = 0; i < len; i++) s += randomChar(pool);
    setOut(s);
  }

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
      <button
        type="button"
        onClick={gen}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
      >
        Generate
      </button>
      <pre className="rounded-lg border border-zinc-800 bg-black/40 p-3 font-mono text-sm text-emerald-300">
        {out || "—"}
      </pre>
    </div>
  );
}
