"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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

  function decode() {
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
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-amber-800 dark:text-amber-200/90">{t("note")}</p>
      <textarea
        className="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={t("paste")}
      />
      <button type="button" className="btn-primary" onClick={decode}>
        {t("decode")}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-1 text-sm font-medium text-slate-500">{t("header")}</h2>
          <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
            {header || "—"}
          </pre>
        </div>
        <div>
          <h2 className="mb-1 text-sm font-medium text-slate-500">{t("payload")}</h2>
          <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
            {payload || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
