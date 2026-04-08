"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pk-cookie-consent";

function getGaId(): string | undefined {
  if (typeof process.env.NEXT_PUBLIC_GA_ID === "string") {
    const id = process.env.NEXT_PUBLIC_GA_ID.trim();
    return id.length > 0 ? id : undefined;
  }
  return undefined;
}

export function CookieAndAnalytics() {
  const gaId = getGaId();
  const t = useTranslations("cookieConsent");
  const [consent, setConsent] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "yes" || v === "no") setConsent(v);
    } catch {
      setConsent(null);
    }
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "yes");
    } catch {
      /* ignore */
    }
    setConsent("yes");
  }, []);

  const decline = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "no");
    } catch {
      /* ignore */
    }
    setConsent("no");
  }, []);

  if (!gaId) return null;

  return (
    <>
      {consent === "yes" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {consent === null ? (
        <div
          role="dialog"
          aria-label={t("bannerAria")}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/95"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-sm text-slate-700 dark:text-zinc-300">
              {t("message")}{" "}
              <Link
                href="/privacy/"
                prefetch={false}
                className="font-medium text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
              >
                {t("privacyLink")}
              </Link>
            </p>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={decline}
                className="btn-ghost text-sm"
              >
                {t("decline")}
              </button>
              <button type="button" onClick={accept} className="btn-primary text-sm">
                {t("accept")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
