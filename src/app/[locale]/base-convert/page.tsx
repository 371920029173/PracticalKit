"use client";

import { ToolPageShell, ToolSection } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

function parseBigInt(value: string, radix: number): bigint {
  const src = value.trim();
  if (!src) throw new Error("empty");
  const negative = src.startsWith("-");
  const body = negative ? src.slice(1) : src;
  if (!body) throw new Error("empty");
  const base = BigInt(radix);
  let out = BigInt(0);
  for (const ch of body.toLowerCase()) {
    const code = ch.charCodeAt(0);
    const digit = code >= 48 && code <= 57 ? code - 48 : code >= 97 && code <= 122 ? code - 87 : -1;
    if (digit < 0 || digit >= radix) throw new Error("digit");
    out = out * base + BigInt(digit);
  }
  return negative ? -out : out;
}

export default function BaseConvertPage() {
  const t = useTranslations("baseConvertPage");
  const [input, setInput] = useState("");
  const [from, setFrom] = useState("10");
  const [result, setResult] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const bases = useMemo(() => ["2", "8", "10", "16", "36"], []);

  const run = useCallback(() => {
    setError("");
    try {
      const n = parseBigInt(input, Number(from));
      setResult({
        "2": n.toString(2),
        "8": n.toString(8),
        "10": n.toString(10),
        "16": n.toString(16),
        "36": n.toString(36),
      });
    } catch {
      setResult({});
      setError(t("invalid"));
    }
  }, [from, input, t]);

  const resetAndRun = useCallback(() => {
    const sample = "4D2";
    setInput(sample);
    setFrom("16");
    try {
      const n = parseBigInt(sample, 16);
      setResult({
        "2": n.toString(2),
        "8": n.toString(8),
        "10": n.toString(10),
        "16": n.toString(16),
        "36": n.toString(36),
      });
      setError("");
    } catch {
      setError(t("invalid"));
    }
  }, [t]);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <textarea
          className="tool-textarea min-h-24"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("input")}
        />
        <label className="space-y-1">
          <span className="tool-muted">{t("fromBase")}</span>
          <select className="tool-select w-full min-w-[7rem]" value={from} onChange={(e) => setFrom(e.target.value)}>
            {bases.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {bases.map((b) => (
          <div key={b}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              {t("baseLabel", { base: b })}
            </p>
            <pre className="tool-pre-out">{result[b] ?? "—"}</pre>
          </div>
        ))}
      </div>
      </ToolSection>
    </ToolPageShell>
  );
}
