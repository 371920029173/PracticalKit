"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

/** Well-known demo JWT (payload is public example data only). */
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function b64UrlDecode(segment: string): string {
  let s = segment.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)!;
  return new TextDecoder().decode(bytes);
}

export default function JwtPage() {
  const t = useTranslations("jwtPage");
  const [raw, setRaw] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [err, setErr] = useState("");

  const decode = useCallback(() => {
    setErr("");
    setHeader("");
    setPayload("");
    const parts = raw.trim().split(".");
    if (parts.length < 2) {
      setErr(t("invalid"));
      return;
    }
    try {
      const h = JSON.stringify(JSON.parse(b64UrlDecode(parts[0]!)), null, 2);
      const p = JSON.stringify(JSON.parse(b64UrlDecode(parts[1]!)), null, 2);
      setHeader(h);
      setPayload(p);
    } catch {
      setErr(t("invalid"));
    }
  }, [raw, t]);

  const resetAndRun = useCallback(() => {
    setRaw(SAMPLE_JWT);
    setErr("");
    setHeader("");
    setPayload("");
    queueMicrotask(() => {
      try {
        const parts = SAMPLE_JWT.split(".");
        const h = JSON.stringify(JSON.parse(b64UrlDecode(parts[0]!)), null, 2);
        const p = JSON.stringify(JSON.parse(b64UrlDecode(parts[1]!)), null, 2);
        setHeader(h);
        setPayload(p);
      } catch {
        setErr(t("invalid"));
      }
    });
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        {t("note")}
      </p>
      <textarea
        className="tool-textarea min-h-32"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={t("paste")}
      />
      <ToolRunActions onRun={decode} onResetAndRun={resetAndRun} />
      {err && (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
            {t("header")}
          </h2>
          <pre className="tool-pre max-h-64 text-xs">{header || "—"}</pre>
        </div>
        <div>
          <h2 className="mb-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
            {t("payload")}
          </h2>
          <pre className="tool-pre max-h-64 text-xs">{payload || "—"}</pre>
        </div>
      </div>
    </div>
  );
}
