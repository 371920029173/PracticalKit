"use client";

import {
  applyFlairToDocument,
  readCachedGeo,
  resolveFlair,
  writeCachedGeo,
  type FlairDef,
  type GeoSnapshot,
} from "@/lib/regional-flair";
import { useTheme } from "@/components/ThemeProvider";
import { useLocale, useTranslations } from "next-intl";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RegionalFlairContextValue = {
  flair: FlairDef | null;
  geo: GeoSnapshot | null;
  daypart: "day" | "night";
};

const RegionalFlairContext = createContext<RegionalFlairContextValue>({
  flair: null,
  geo: null,
  daypart: "day",
});

async function fetchGeo(): Promise<GeoSnapshot | null> {
  const cached = readCachedGeo();
  if (cached) return cached;
  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success?: boolean;
      country_code?: string;
      country?: string;
    };
    if (data.success === false || !data.country_code) return null;
    const snap: GeoSnapshot = {
      countryCode: data.country_code.toUpperCase(),
      country: data.country,
      ts: Date.now(),
    };
    writeCachedGeo(snap);
    return snap;
  } catch {
    return null;
  }
}

function MapleLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2c-.5 1.2-1.2 2.2-2.1 2.9.8-.1 1.6-.2 2.4-.3-.6 1-.9 2.1-.8 3.2-.9-.7-1.9-1.2-3-1.5.5 1 .7 2.1.5 3.2-1-.4-1.9-1-2.7-1.7.1 1.1 0 2.2-.4 3.2 1.2-.2 2.3-.1 3.4.3-.9.8-1.5 1.8-1.8 2.9 1.1-.5 2.2-.7 3.3-.5-.5 1.2-.4 2.5.2 3.6 1-.9 1.7-2 2.1-3.2v3.4c.8-.9 1.9-1.5 3.1-1.7-.4 1.2-.3 2.5.3 3.6 1-.5 1.8-1.2 2.4-2.1.1 1.2.5 2.3 1.2 3.2 1.1-1.1 1.8-2.5 2-4 .2 1.5.9 2.9 2 4 .7-.9 1.1-2 1.2-3.2.6.9 1.4 1.6 2.4 2.1.6-1.1.7-2.4.3-3.6 1.2.2 2.3.8 3.1 1.7v-3.4c.4 1.2 1.1 2.3 2.1 3.2.6-1.1.7-2.4.2-3.6 1.1-.2 2.2 0 3.3.5-.3-1.1-.9-2.1-1.8-2.9 1.1-.4 2.2-.5 3.4-.3-.4-1-.5-2.1-.4-3.2-.8.7-1.7 1.3-2.7 1.7-.2-1.1 0-2.2.5-3.2-1.1.3-2.1.8-3 1.5.1-1.1-.2-2.2-.8-3.2.8.1 1.6.2 2.4.3-.9-.7-1.6-1.7-2.1-2.9z" />
    </svg>
  );
}

function FloatingDecor({ decoration, daypart }: { decoration: string; daypart: "day" | "night" }) {
  if (decoration === "maple") {
    const count = daypart === "day" ? 5 : 3;
    return (
      <div className="flair-float-layer flair-float-maple" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <MapleLeaf
            key={i}
            className={`flair-maple-leaf flair-maple-leaf-${i + 1} ${daypart === "night" ? "flair-maple-night" : ""}`}
          />
        ))}
      </div>
    );
  }

  if (decoration === "stars") {
    return (
      <div className="flair-float-layer flair-float-stars" aria-hidden>
        {Array.from({ length: daypart === "night" ? 24 : 12 }, (_, i) => (
          <span key={i} className={`flair-star flair-star-${(i % 6) + 1}`} />
        ))}
      </div>
    );
  }

  if (decoration === "lantern" || decoration === "blossom" || decoration === "sakura") {
    return (
      <div className={`flair-float-layer flair-float-petal flair-petal-${daypart}`} aria-hidden>
        {Array.from({ length: daypart === "day" ? 8 : 5 }, (_, i) => (
          <span key={i} className={`flair-petal flair-petal-${(i % 4) + 1}`} />
        ))}
      </div>
    );
  }

  if (decoration === "tricolor") {
    return <div className={`flair-band flair-tricolor flair-tricolor-${daypart}`} aria-hidden />;
  }

  if (decoration === "sunset") {
    return <div className={`flair-horizon flair-sunset flair-sunset-${daypart}`} aria-hidden />;
  }

  if (decoration === "aurora") {
    return <div className={`flair-aurora flair-aurora-${daypart}`} aria-hidden />;
  }

  if (decoration === "mist") {
    return <div className={`flair-mist flair-mist-${daypart}`} aria-hidden />;
  }

  if (decoration === "outback") {
    return <div className={`flair-horizon flair-outback flair-outback-${daypart}`} aria-hidden />;
  }

  if (decoration === "hangul") {
    return (
      <div className="flair-float-layer flair-float-hangul" aria-hidden>
        {["ㄱ", "ㅎ", "◈"].map((ch, i) => (
          <span key={ch} className={`flair-hangul flair-hangul-${i + 1}`}>
            {ch}
          </span>
        ))}
      </div>
    );
  }

  return null;
}

export function RegionalFlairProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { theme } = useTheme();
  const daypart = theme === "dark" ? "night" : "day";
  const [geo, setGeo] = useState<GeoSnapshot | null>(null);

  const flair = useMemo(
    () => resolveFlair(geo?.countryCode ?? null, locale),
    [geo?.countryCode, locale],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchGeo().then((snap) => {
      if (!cancelled) setGeo(snap);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyFlairToDocument(flair, daypart);
  }, [flair, daypart]);

  return (
    <RegionalFlairContext.Provider value={{ flair, geo, daypart }}>
      {flair ? (
        <>
          <div className="flair-ambient" aria-hidden />
          <FloatingDecor decoration={flair.decoration} daypart={daypart} />
        </>
      ) : null}
      {children}
    </RegionalFlairContext.Provider>
  );
}

export function RegionalFlairBadge() {
  const t = useTranslations("regionalFlair");
  const { flair } = useContext(RegionalFlairContext);
  if (!flair) return null;

  return (
    <span
      className="flair-badge btn-motion"
      title={t("hint", { badge: flair.badge })}
      aria-label={t("hint", { badge: flair.badge })}
    >
      {flair.badge}
    </span>
  );
}

/** @deprecated Use RegionalFlairProvider */
export function RegionalFlairLayer() {
  return null;
}
