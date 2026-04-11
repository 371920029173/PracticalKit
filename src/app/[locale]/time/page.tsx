"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useState } from "react";
import { useTranslations } from "next-intl";

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
    const n = parseFloat(ts);
    if (Number.isNaN(n)) {
      setOut1("bad number");
      return;
    }
    const sec = n > 1e12 ? n / 1000 : n;
    setOut1(new Date(sec * 1000).toString() + ` (${sec}s)`);
  }

  function dateToTs() {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      setOut2("bad date");
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
    setTs(String(s));
    setIso(new Date().toISOString().slice(0, 19));
    setOut1(new Date(s * 1000).toString() + ` (${s}s)`);
    const d = new Date(s * 1000);
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
          placeholder="2026-04-07T12:00:00"
        />
        <pre className="rounded border border-zinc-800 bg-black/30 p-2 text-sm">{out2}</pre>
      </section>
    </div>
  );
}
