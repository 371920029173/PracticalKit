"use client";

import { useContext } from "react";
import { RegionalFlairContext } from "@/components/RegionalFlair";

export function RegionalFlairPageDecor() {
  const { flair, daypart } = useContext(RegionalFlairContext);
  if (!flair) return null;

  return (
    <div className="flair-page-decor" aria-hidden data-decoration={flair.decoration}>
      <span className="flair-page-corner flair-page-corner-tl">{flair.badge}</span>
      <span className="flair-page-corner flair-page-corner-tr">{flair.badge}</span>
      <span className="flair-page-corner flair-page-corner-bl">{flair.badge}</span>
      <span className="flair-page-corner flair-page-corner-br">{flair.badge}</span>
      <div className={`flair-page-band flair-page-band-${daypart}`} />
      <div className="flair-page-drift">
        {Array.from({ length: daypart === "day" ? 6 : 4 }, (_, i) => (
          <span key={i} className={`flair-page-orb flair-page-orb-${(i % 3) + 1}`} />
        ))}
      </div>
    </div>
  );
}
