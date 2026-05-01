"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef } from "react";
import { AD_SLOTS, ADSENSE_CLIENT, IN_FEED_LAYOUT_KEY } from "@/lib/adsense";

type AdVariant = "display" | "multiplex" | "infeed";

type AdsenseUnitProps = {
  variant: AdVariant;
  slot?: string;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdsenseScript() {
  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}

export function AdsenseUnit({ variant, slot, className }: AdsenseUnitProps) {
  const adRef = useRef<HTMLElement | null>(null);
  const resolvedSlot = slot ?? defaultSlotFor(variant);

  const attrs = useMemo(() => {
    if (variant === "infeed") {
      return {
        "data-ad-format": "fluid",
        "data-ad-layout-key": IN_FEED_LAYOUT_KEY,
      };
    }
    if (variant === "multiplex") {
      return { "data-ad-format": "autorelaxed" };
    }
    return {
      "data-ad-format": "auto",
      "data-full-width-responsive": "true",
    };
  }, [variant]);

  useEffect(() => {
    try {
      if (!adRef.current) return;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore if ad script is blocked by network/privacy settings.
    }
  }, [resolvedSlot, variant]);

  return (
    <ins
      ref={(el) => {
        adRef.current = el;
      }}
      className={`adsbygoogle block ${className ?? ""}`.trim()}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={resolvedSlot}
      {...attrs}
    />
  );
}

function defaultSlotFor(variant: AdVariant): string {
  if (variant === "multiplex") return AD_SLOTS.multiplexPrimary;
  if (variant === "infeed") return AD_SLOTS.inFeedPrimary;
  return AD_SLOTS.displayPrimary;
}
