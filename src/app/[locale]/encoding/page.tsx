"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"b64en" | "b64de" | "ure" | "urd">("b64en");
  const [out, setOut] = useState("");

  function run() {
    try {
      if (mode === "b64en") setOut(u8ToB64(new TextEncoder().encode(text)));
      else if (mode === "b64de")
        setOut(new TextDecoder().decode(b64ToU8(text.trim())));
      else if (mode === "ure") setOut(encodeURIComponent(text));
      else setOut(decodeURIComponent(text.replace(/\+/g, "%20")));
    } catch (e) {
      setOut(`Error: ${e}`);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
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
            className={`rounded-full px-3 py-1 ${
              mode === k
                ? "bg-white text-zinc-900"
                : "border border-zinc-700 text-zinc-300"
            }`}
          >
            {lab}
          </button>
        ))}
      </div>
      <textarea
        className="min-h-40 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="button"
        onClick={run}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
      >
        Run
      </button>
      <pre className="min-h-24 whitespace-pre-wrap break-all rounded-lg border border-zinc-800 bg-black/40 p-3 text-sm text-zinc-200">
        {out}
      </pre>
    </div>
  );
}
