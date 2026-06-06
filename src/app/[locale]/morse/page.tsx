"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const TO_MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", $: "...-..-", "@": ".--.-.",
};

const FROM_MORSE = Object.fromEntries(
  Object.entries(TO_MORSE).map(([k, v]) => [v, k]),
);

function encodeMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((c) => (c === " " ? "/" : TO_MORSE[c] ?? "#"))
    .join(" ");
}

function decodeMorse(code: string): string {
  return code
    .trim()
    .split(/\s*\/\s*|\s{2,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((token) => FROM_MORSE[token] ?? "?")
        .join(""),
    )
    .join(" ");
}

export default function MorsePage() {
  const t = useTranslations("morsePage");
  const tc = useTranslations("common");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = useCallback(() => {
    setOutput(mode === "encode" ? encodeMorse(input) : decodeMorse(input));
  }, [mode, input]);

  const resetAndRun = useCallback(() => {
    const sample = t("sample");
    setMode("encode");
    setInput(sample);
    setOutput(encodeMorse(sample));
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex flex-wrap gap-2">
        {(["encode", "decode"] as const).map((m) => (
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
      <textarea
        className="tool-textarea min-h-24"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? t("textIn") : t("morseIn")}
      />
      <div className="flex flex-wrap gap-2">
        <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
        {output ? (
          <button type="button" className="btn-ghost text-sm" onClick={() => void navigator.clipboard.writeText(output)}>
            {tc("copy")}
          </button>
        ) : null}
      </div>
      <pre className="tool-pre-out font-mono">{output || "—"}</pre>
    </div>
  );
}
