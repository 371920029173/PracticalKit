"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type IpInfo = {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  isp?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
};

export default function IpLookupPage() {
  const t = useTranslations("ipLookupPage");
  const tc = useTranslations("common");
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const lookup = useCallback(async () => {
    setBusy(true);
    setErr("");
    setInfo(null);
    try {
      const res = await fetch("https://ipwho.is/");
      if (!res.ok) throw new Error("http");
      const data = (await res.json()) as IpInfo & { success?: boolean; message?: string };
      if (data.success === false) throw new Error(data.message ?? "fail");
      setInfo(data);
    } catch {
      setErr(t("error"));
    } finally {
      setBusy(false);
    }
  }, [t]);

  useEffect(() => {
    void lookup();
  }, [lookup]);

  const resetAndRun = useCallback(async () => {
    await lookup();
  }, [lookup]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex flex-wrap gap-2">
        <ToolRunActions onRun={lookup} onResetAndRun={resetAndRun} busy={busy} />
        {info ? (
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => void navigator.clipboard.writeText(JSON.stringify(info, null, 2))}
          >
            {tc("copy")}
          </button>
        ) : null}
      </div>
      {err ? <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
      {info ? (
        <dl className="glass-panel grid gap-3 rounded-2xl p-5 sm:grid-cols-2">
          {(
            [
              ["ip", info.ip],
              ["country", info.country ? `${info.country} (${info.country_code ?? "—"})` : "—"],
              ["region", info.region ?? "—"],
              ["city", info.city ?? "—"],
              ["isp", info.isp ?? "—"],
              ["timezone", info.timezone ?? "—"],
              [
                "coords",
                info.latitude != null && info.longitude != null
                  ? `${info.latitude}, ${info.longitude}`
                  : "—",
              ],
            ] as const
          ).map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                {t(key)}
              </dt>
              <dd className="mt-1 font-mono text-sm text-slate-900 dark:text-zinc-100">{value}</dd>
            </div>
          ))}
        </dl>
      ) : busy ? (
        <div className="loader-row py-8" aria-live="polite">
          <span className="loader-dot" />
          <span className="loader-dot" style={{ animationDelay: "120ms" }} />
          <span className="loader-dot" style={{ animationDelay: "240ms" }} />
        </div>
      ) : null}
      <p className="text-xs text-slate-500 dark:text-zinc-500">{t("provider")}</p>
    </div>
  );
}
