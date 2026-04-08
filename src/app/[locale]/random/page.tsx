"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function uuidV4() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function randomHex(bytes: number) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export default function RandomPage() {
  const t = useTranslations("random");
  const [serialCount, setSerialCount] = useState(5);
  const [out, setOut] = useState("");

  function serials() {
    const lines: string[] = [];
    for (let i = 0; i < serialCount; i++) {
      const n = (1000 + Math.floor(Math.random() * 9000)).toString();
      lines.push(`SN-${n}-${randomHex(2).toUpperCase()}`);
    }
    setOut(lines.join("\n"));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
          onClick={() => setOut(`${t("uuid")}:\n${uuidV4()}`)}
        >
          {t("uuid")}
        </button>
        <button
          type="button"
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
          onClick={() => setOut(`${t("bytes")} (32):\n${randomHex(32)}`)}
        >
          {t("bytes")}
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">{t("serial")}</span>
        <input
          type="number"
          min={1}
          max={500}
          className="w-20 rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          value={serialCount}
          onChange={(e) => setSerialCount(+e.target.value || 1)}
        />
        <button
          type="button"
          onClick={serials}
          className="rounded-lg bg-white px-3 py-1 text-sm font-medium text-zinc-900"
        >
          Run
        </button>
      </div>
      <pre className="min-h-24 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-black/40 p-3 font-mono text-sm text-zinc-200">
        {out || "—"}
      </pre>
    </div>
  );
}
