"use client";

import { ToolPageShell } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

function parseUa(ua: string) {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) && !/Edg\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) && !/Chrome\//.test(ua) ? "Safari" :
    "Unknown";
  const os =
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" :
    "Unknown";
  const mobile = /Mobile|Android|iPhone|iPad/.test(ua);
  return { browser, os, mobile };
}

export default function UserAgentPage() {
  const t = useTranslations("userAgentPage");
  const tc = useTranslations("common");
  const [ua, setUa] = useState("");
  const [ran, setRan] = useState(false);

  const parsed = useMemo(() => parseUa(ua), [ua]);

  const run = useCallback(() => {
    setUa(typeof navigator !== "undefined" ? navigator.userAgent : "");
    setRan(true);
  }, []);

  const resetAndRun = useCallback(() => {
    run();
  }, [run]);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
      {ran ? (
        <>
          <textarea className="tool-textarea min-h-24" readOnly value={ua} aria-label={t("uaLabel")} />
          <dl className="glass-panel grid gap-3 rounded-2xl p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">{t("browser")}</dt>
              <dd className="mt-1 text-sm font-medium">{parsed.browser}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">{t("os")}</dt>
              <dd className="mt-1 text-sm font-medium">{parsed.os}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">{t("mobile")}</dt>
              <dd className="mt-1 text-sm font-medium">{parsed.mobile ? t("yes") : t("no")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">{t("language")}</dt>
              <dd className="mt-1 text-sm font-medium">{typeof navigator !== "undefined" ? navigator.language : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">{t("screen")}</dt>
              <dd className="mt-1 text-sm font-medium">
                {typeof screen !== "undefined" ? `${screen.width}×${screen.height}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">{t("dpr")}</dt>
              <dd className="mt-1 text-sm font-medium">
                {typeof window !== "undefined" ? window.devicePixelRatio : "—"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => void navigator.clipboard.writeText(ua)}
          >
            {tc("copy")}
          </button>
        </>
      ) : null}
    </ToolPageShell>
  );
}
