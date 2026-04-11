"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function u8ToB64(u8: Uint8Array) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]!);
  return btoa(s);
}

function b64ToU8(b64: string) {
  const bin = atob(b64.replace(/\s/g, ""));
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)!;
  return u8;
}

export default function EncodingPage() {
  const t = useTranslations("encoding");
  const [text, setText] = useState("Hello");
  const [mode, setMode] = useState<"b64en" | "b64de" | "ure" | "urd">("b64en");
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    try {
      if (mode === "b64en") setOut(u8ToB64(new TextEncoder().encode(text)));
      else if (mode === "b64de")
        setOut(new TextDecoder().decode(b64ToU8(text.trim())));
      else if (mode === "ure") setOut(encodeURIComponent(text));
      else setOut(decodeURIComponent(text.replace(/\+/g, "%20")));
    } catch (e) {
      setOut(`Error: ${e}`);
    }
  }, [mode, text]);

  const resetAndRun = useCallback(() => {
    setText("Hello");
    setMode("b64en");
    setOut("");
    queueMicrotask(() => {
      try {
        setOut(u8ToB64(new TextEncoder().encode("Hello")));
      } catch (e) {
        setOut(`Error: ${e}`);
      }
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <div className="flex flex-wrap gap-2 text-sm">
        {(
          [
            ["b64en", t("b64") + " →"],
            ["b64de", "→ " + t("b64")],
            ["ure", t("url") + " enc"],
            ["urd", t("url") + " dec"],
          ] as const
        ).map(([k, lab]) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={`tool-chip ${mode === k ? "tool-chip-on" : "tool-chip-off"}`}
          >
            {lab}
          </button>
        ))}
      </div>
      <textarea
        className="tool-textarea min-h-40"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      <pre className="tool-pre-out text-sm">{out || "—"}</pre>
    </div>
  );
}
