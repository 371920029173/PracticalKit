"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const DEF_Q = "Hello";
const DEF_FROM = "en";
const DEF_TO = "zh";

export default function TranslatePage() {
  const t = useTranslations("translate");
  const [q, setQ] = useState(DEF_Q);
  const [from, setFrom] = useState(DEF_FROM);
  const [to, setTo] = useState(DEF_TO);
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setOut("");
    try {
      const u = new URL("https://api.mymemory.translated.net/get");
      u.searchParams.set("q", q);
      u.searchParams.set("langpair", `${from}|${to}`);
      const res = await fetch(u.toString());
      const data = (await res.json()) as {
        responseData?: { translatedText?: string };
        responseStatus?: number;
      };
      setOut(data.responseData?.translatedText || JSON.stringify(data));
    } catch (e) {
      setOut(String(e));
    } finally {
      setLoading(false);
    }
  }, [q, from, to]);

  const resetAndRun = useCallback(async () => {
    setQ(DEF_Q);
    setFrom(DEF_FROM);
    setTo(DEF_TO);
    setOut("");
    setLoading(true);
    try {
      const u = new URL("https://api.mymemory.translated.net/get");
      u.searchParams.set("q", DEF_Q);
      u.searchParams.set("langpair", `${DEF_FROM}|${DEF_TO}`);
      const res = await fetch(u.toString());
      const data = (await res.json()) as {
        responseData?: { translatedText?: string };
      };
      setOut(data.responseData?.translatedText || JSON.stringify(data));
    } catch (e) {
      setOut(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
        {t("disclaimer")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="tool-muted">{t("from")}</span>
          <input
            className="tool-field mt-1 w-full font-mono uppercase"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="tool-muted">{t("to")}</span>
          <input
            className="tool-field mt-1 w-full font-mono uppercase"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <textarea
        className="tool-textarea min-h-32"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <ToolRunActions
        onRun={run}
        onResetAndRun={resetAndRun}
        busy={loading}
      />
      <pre className="tool-pre-out">{out || "—"}</pre>
    </div>
  );
}
