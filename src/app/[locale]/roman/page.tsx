"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const PAIRS: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return "";
  let rest = n;
  let out = "";
  for (const [v, s] of PAIRS) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}

function fromRoman(raw: string): number | null {
  const s = raw.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(s)) return null;
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]!]!;
    const next = map[s[i + 1]!] ?? 0;
    total += cur < next ? -cur : cur;
  }
  return total >= 1 && total <= 3999 && toRoman(total) === s ? total : null;
}

export default function RomanPage() {
  const t = useTranslations("romanPage");
  const tc = useTranslations("common");
  const [mode, setMode] = useState<"to" | "from">("to");
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState(false);

  const run = useCallback(() => {
    setErr(false);
    if (mode === "to") {
      const n = parseInt(input.trim(), 10);
      const r = toRoman(n);
      if (!r) {
        setErr(true);
        setOut("");
        return;
      }
      setOut(r);
    } else {
      const n = fromRoman(input);
      if (n == null) {
        setErr(true);
        setOut("");
        return;
      }
      setOut(String(n));
    }
  }, [mode, input]);

  const resetAndRun = useCallback(() => {
    setMode("to");
    setInput("2026");
    setOut("MMXXVI");
    setErr(false);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex flex-wrap gap-2">
        {(["to", "from"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`tool-chip ${mode === m ? "tool-chip-on" : "tool-chip-off"}`}
            onClick={() => setMode(m)}
          >
            {t(m)}
          </button>
        ))}
      </div>
      <input
        className="tool-field w-full font-mono"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "to" ? t("numberIn") : t("romanIn")}
      />
      <div className="flex flex-wrap gap-2">
        <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
        {out ? (
          <button type="button" className="btn-ghost text-sm" onClick={() => void navigator.clipboard.writeText(out)}>
            {tc("copy")}
          </button>
        ) : null}
      </div>
      {err ? <p className="text-sm text-rose-600">{t("invalid")}</p> : null}
      <pre className="tool-pre-out text-xl font-semibold">{out || "—"}</pre>
    </div>
  );
}
