"use client";

import { ToolPageShell, ToolSection, ToolStatGrid } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { fetchIpGeo, type IpGeoResult } from "@/lib/geo-api";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

export default function IpLookupPage() {
  const t = useTranslations("ipLookupPage");
  const tc = useTranslations("common");
  const [info, setInfo] = useState<IpGeoResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const lookup = useCallback(async () => {
    setBusy(true);
    setErr("");
    setInfo(null);
    try {
      const data = await fetchIpGeo({ useCache: false });
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
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolSection>
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
        {err ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
        {info ? (
          <>
            <ToolStatGrid
              items={[
                { label: t("ip"), value: info.ip },
                {
                  label: t("country"),
                  value: info.country ? `${info.country} (${info.country_code ?? "—"})` : info.country_code ?? "—",
                },
                { label: t("region"), value: info.region ?? "—" },
                { label: t("city"), value: info.city ?? "—" },
                { label: t("isp"), value: info.isp ?? "—" },
                { label: t("timezone"), value: info.timezone ?? "—" },
                {
                  label: t("coords"),
                  value:
                    info.latitude != null && info.longitude != null
                      ? `${info.latitude}, ${info.longitude}`
                      : "—",
                },
              ]}
            />
            <p className="mt-4 text-xs text-slate-500 dark:text-zinc-500">
              {t("provider", { source: info.source })}
            </p>
          </>
        ) : busy ? (
          <div className="loader-row py-8" aria-live="polite">
            <span className="loader-dot" />
            <span className="loader-dot" style={{ animationDelay: "120ms" }} />
            <span className="loader-dot" style={{ animationDelay: "240ms" }} />
          </div>
        ) : null}
      </ToolSection>
    </ToolPageShell>
  );
}
