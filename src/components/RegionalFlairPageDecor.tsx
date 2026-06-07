"use client";

import { useContext } from "react";
import { RegionalFlairContext } from "@/components/RegionalFlair";
import { FlairBadgeIcon } from "@/components/FlairBadgeIcon";

export function RegionalFlairPageDecor() {
  const { resolved, daypart } = useContext(RegionalFlairContext);
  if (!resolved) return null;

  return (
    <div className="flair-page-decor" aria-hidden data-decoration={resolved.decoration}>
      {resolved.countryBadge ? (
        <span className="flair-page-corner flair-page-corner-tl">
          <FlairBadgeIcon kind={resolved.countryBadge} size="lg" />
        </span>
      ) : null}
      {resolved.localeBadge ? (
        <span className="flair-page-corner flair-page-corner-tr">
          <FlairBadgeIcon kind={resolved.localeBadge} size="md" />
        </span>
      ) : null}
      {resolved.localeBadge ? (
        <span className="flair-page-corner flair-page-corner-bl">
          <FlairBadgeIcon kind={resolved.localeBadge} size="md" />
        </span>
      ) : null}
      {resolved.countryBadge ? (
        <span className="flair-page-corner flair-page-corner-br">
          <FlairBadgeIcon kind={resolved.countryBadge} size="lg" />
        </span>
      ) : null}
      <div className={`flair-page-band flair-page-band-${daypart}`} />
      <div className="flair-page-drift">
        {Array.from({ length: daypart === "day" ? 6 : 4 }, (_, i) => (
          <span key={i} className={`flair-page-orb flair-page-orb-${(i % 3) + 1}`} />
        ))}
      </div>
    </div>
  );
}
