"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";

function parseTimestamp(raw: string): number | null {
  const n = Number(raw.trim());
  if (!Number.isFinite(n)) return null;
  return Math.abs(n) >= 1e12 ? n / 1000 : n;
}

function parseIsoLocal(raw: string): Date | null {
  const v = raw.trim();
  if (!v) return null;
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00` : v;
  const d = new Date(withSeconds);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimePage() {
  const t = useTranslations("time");
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState(new Date().toISOString().slice(0, 19));
  const [out1, setOut1] = useState("");
  const [out2, setOut2] = useState("");

  function now() {
    const s = Math.floor(Date.now() / 1000);
    setTs(String(s));
    setOut1(new Date(s * 1000).toString());
  }

  function tsToDate() {
    const sec = parseTimestamp(ts);
    if (sec == null) {
      setOut1("Invalid timestamp");
      return;
    }
    const d = new Date(sec * 1000);
    setOut1(`${d.toString()}\n${d.toISOString()}\n(${sec}s)`);
  }

  function dateToTs() {
    const d = parseIsoLocal(iso);
    if (!d) {
      setOut2("Invalid date/time");
      return;
    }
    setOut2(`${Math.floor(d.getTime() / 1000)} s\n${d.getTime()} ms`);
  }

  function runAll() {
    tsToDate();
    dateToTs();
  }

  function resetAndRun() {
    const s = Math.floor(Date.now() / 1000);
    const d = new Date(s * 1000);
    setTs(String(s));
    setIso(new Date().toISOString().slice(0, 16));
    setOut1(`${d.toString()}\n${d.toISOString()}\n(${s}s)`);
    setOut2(`${Math.floor(d.getTime() / 1000)} s\n${d.getTime()} ms`);
  }

  return (
    <div className="space-y-6">
      <h1 className="tool-h1">{t("title")}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={now}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
        >
          {t("now")}
        </button>
        <ToolRunActions onRun={runAll} onResetAndRun={resetAndRun} />
      </div>
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-400">{t("toDate")}</h2>
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
          value={ts}
          onChange={(e) => setTs(e.target.value)}
        />
        <pre className="rounded border border-zinc-800 bg-black/30 p-2 text-sm">{out1}</pre>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-400">{t("toTs")}</h2>
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
          placeholder="2026-04-07T12:00"
        />
        <pre className="rounded border border-zinc-800 bg-black/30 p-2 text-sm">{out2}</pre>
      </section>
    </div>
  );
}
