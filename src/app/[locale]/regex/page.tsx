"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function RegexPage() {
  const t = useTranslations("regex");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [haystack, setHaystack] = useState("");
  const [out, setOut] = useState("");

  function run() {
    try {
      const re = new RegExp(pattern, flags);
      const matches = Array.from(haystack.matchAll(re));
      setOut(
        matches.length
          ? matches.map((m) => `${m.index}: ${JSON.stringify(m[0])}`).join("\n")
          : "(no matches)"
      );
    } catch (e) {
      setOut(`Error: ${e}`);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-400">{t("pattern")}</span>
          <input
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-400">{t("flags")}</span>
          <input
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-zinc-400">{t("haystack")}</span>
        <textarea
          className="min-h-32 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
          value={haystack}
          onChange={(e) => setHaystack(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={run}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
      >
        Run
      </button>
      <pre className="max-h-64 overflow-auto rounded-lg border border-zinc-800 bg-black/40 p-3 text-xs text-zinc-300">
        {out || "—"}
      </pre>
    </div>
  );
}
