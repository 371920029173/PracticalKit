"use client";

import { FlairBadgeIcon } from "@/components/FlairBadgeIcon";
import {
  DEFAULT_FLAIR_PREFS,
  FLAIR_DEFS,
  LOCALE_FLAIR_DEFS,
  type FlairUserPrefs,
  type ResolvedFlair,
} from "@/lib/regional-flair";
import { useTranslations } from "next-intl";
import { useContext, useEffect, useRef, useState } from "react";
import { RegionalFlairContext } from "@/components/RegionalFlair";

const COUNTRY_OPTIONS = FLAIR_DEFS.map((d) => d.id);
const LOCALE_OPTIONS = LOCALE_FLAIR_DEFS.map((d) => d.id);

export function RegionalFlairControl() {
  const t = useTranslations("regionalFlair");
  const { resolved, prefs, setPrefs } = useContext(RegionalFlairContext);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!resolved) return null;

  return (
    <div ref={wrapRef} className="flair-control-wrap relative">
      <button
        type="button"
        className="flair-badge flair-badge-dual btn-motion"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={t("openPicker")}
      >
        {resolved.countryBadge ? <FlairBadgeIcon kind={resolved.countryBadge} size="sm" /> : null}
        {resolved.localeBadge ? <FlairBadgeIcon kind={resolved.localeBadge} size="sm" /> : null}
      </button>

      {open ? (
        <div className="flair-picker glass-panel" role="dialog" aria-label={t("pickerTitle")}>
          <p className="flair-picker-title">{t("pickerTitle")}</p>
          <p className="flair-picker-desc">{t("pickerDesc")}</p>

          <label className="flair-picker-field">
            <span>{t("countryLabel")}</span>
            <select
              className="tool-select w-full"
              value={prefs.country}
              onChange={(e) => setPrefs({ ...prefs, country: e.target.value as FlairUserPrefs["country"] })}
            >
              <option value="auto">{t("auto")}</option>
              <option value="off">{t("off")}</option>
              {COUNTRY_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {t(`country.${id}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="flair-picker-field">
            <span>{t("localeLabel")}</span>
            <select
              className="tool-select w-full"
              value={prefs.locale}
              onChange={(e) => setPrefs({ ...prefs, locale: e.target.value as FlairUserPrefs["locale"] })}
            >
              <option value="auto">{t("auto")}</option>
              <option value="off">{t("off")}</option>
              {LOCALE_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {t(`locale.${id}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="flair-picker-field">
            <span>{t("decorLabel")}</span>
            <select
              className="tool-select w-full"
              value={prefs.decorFrom}
              onChange={(e) =>
                setPrefs({ ...prefs, decorFrom: e.target.value as FlairUserPrefs["decorFrom"] })
              }
            >
              <option value="auto">{t("decorAuto")}</option>
              <option value="country">{t("decorCountry")}</option>
              <option value="locale">{t("decorLocale")}</option>
            </select>
          </label>

          <div className="flair-picker-preview">
            <PreviewBadges resolved={resolved} />
          </div>

          <button
            type="button"
            className="btn-ghost w-full text-xs"
            onClick={() => setPrefs(DEFAULT_FLAIR_PREFS)}
          >
            {t("reset")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PreviewBadges({ resolved }: { resolved: ResolvedFlair }) {
  return (
    <span className="flair-badge flair-badge-dual">
      {resolved.countryBadge ? <FlairBadgeIcon kind={resolved.countryBadge} size="sm" /> : null}
      {resolved.localeBadge ? <FlairBadgeIcon kind={resolved.localeBadge} size="sm" /> : null}
    </span>
  );
}

/** @deprecated Use RegionalFlairControl */
export function RegionalFlairBadge() {
  return <RegionalFlairControl />;
}
