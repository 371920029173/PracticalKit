"use client";

import { ToolPageShell } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const ZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Moscow",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Australia/Sydney",
] as const;

function convert(isoLocal: string, from: string, to: string): string {
  const d = new Date(isoLocal);
  if (Number.isNaN(d.getTime())) return "";
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: to,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "00";
  const line = `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
  const offset = new Intl.DateTimeFormat("en", {
    timeZone: to,
    timeZoneName: "shortOffset",
  })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value;
  return `${line} (${to}${offset ? `, ${offset}` : ""})\nFrom: ${from}`;
}

export default function TimezonePage() {
  const t = useTranslations("timezonePage");
  const tc = useTranslations("common");
  const [when, setWhen] = useState(() => new Date().toISOString().slice(0, 19));
  const [from, setFrom] = useState<(typeof ZONES)[number]>("UTC");
  const [to, setTo] = useState<(typeof ZONES)[number]>("Asia/Shanghai");
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    const iso = when.includes("T") ? when : `${when}T00:00:00`;
    const result = convert(iso.endsWith("Z") ? iso : `${iso}Z`, from, to);
    setOut(result || t("invalid"));
  }, [when, from, to, t]);

  const resetAndRun = useCallback(() => {
    const now = new Date().toISOString().slice(0, 19);
    setWhen(now);
    setFrom("UTC");
    setTo("Asia/Shanghai");
    setOut(convert(`${now}Z`, "UTC", "Asia/Shanghai"));
  }, []);

  const zones = useMemo(() => ZONES, []);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <label className="block space-y-1 text-sm">
        <span className="text-slate-700 dark:text-zinc-300">{t("datetime")}</span>
        <input className="tool-field w-full font-mono" value={when} onChange={(e) => setWhen(e.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>{t("fromZone")}</span>
          <select className="tool-select w-full" value={from} onChange={(e) => setFrom(e.target.value as typeof from)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>{t("toZone")}</span>
          <select className="tool-select w-full" value={to} onChange={(e) => setTo(e.target.value as typeof to)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
        {out ? (
          <button type="button" className="btn-ghost text-sm" onClick={() => void navigator.clipboard.writeText(out)}>
            {tc("copy")}
          </button>
        ) : null}
      </div>
      <pre className="tool-pre-out whitespace-pre-wrap">{out || "—"}</pre>
    </ToolPageShell>
  );
}
