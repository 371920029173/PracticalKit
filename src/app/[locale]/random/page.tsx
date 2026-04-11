"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

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
  const tc = useTranslations("common");
  const [serialCount, setSerialCount] = useState(5);
  const [out, setOut] = useState("");

  const serials = useCallback(() => {
    const lines: string[] = [];
    for (let i = 0; i < serialCount; i++) {
      const n = (1000 + Math.floor(Math.random() * 9000)).toString();
      lines.push(`SN-${n}-${randomHex(2).toUpperCase()}`);
    }
    setOut(lines.join("\n"));
  }, [serialCount]);

  const resetSerialAndRun = useCallback(() => {
    setSerialCount(5);
    setOut("");
    queueMicrotask(() => {
      const lines: string[] = [];
      for (let i = 0; i < 5; i++) {
        const n = (1000 + Math.floor(Math.random() * 9000)).toString();
        lines.push(`SN-${n}-${randomHex(2).toUpperCase()}`);
      }
      setOut(lines.join("\n"));
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => setOut(`${t("uuid")}:\n${uuidV4()}`)}
        >
          {t("uuid")}
        </button>
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => setOut(`${t("bytes")} (32):\n${randomHex(32)}`)}
        >
          {t("bytes")}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="tool-muted">{t("serial")}</span>
        <input
          type="number"
          min={1}
          max={500}
          className="tool-field w-20"
          value={serialCount}
          onChange={(e) => setSerialCount(+e.target.value || 1)}
        />
        <ToolRunActions
          onRun={serials}
          onResetAndRun={resetSerialAndRun}
          runLabel={tc("run")}
        />
      </div>
      <pre className="tool-pre-out font-mono text-sm">{out || "—"}</pre>
    </div>
  );
}
