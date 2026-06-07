import type { FlairBadgeKind } from "@/lib/regional-flair";
import type { CSSProperties } from "react";

type FlairBadgeIconProps = {
  kind: FlairBadgeKind;
  className?: string;
  style?: CSSProperties;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "flair-badge-icon-sm",
  md: "flair-badge-icon-md",
  lg: "flair-badge-icon-lg",
} as const;

function MapleIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden fill="currentColor">
      <path d="M12 2c-.5 1.2-1.2 2.2-2.1 2.9.8-.1 1.6-.2 2.4-.3-.6 1-.9 2.1-.8 3.2-.9-.7-1.9-1.2-3-1.5.5 1 .7 2.1.5 3.2-1-.4-1.9-1-2.7-1.7.1 1.1 0 2.2-.4 3.2 1.2-.2 2.3-.1 3.4.3-.9.8-1.5 1.8-1.8 2.9 1.1-.5 2.2-.7 3.3-.5-.5 1.2-.4 2.5.2 3.6 1-.9 1.7-2 2.1-3.2v3.4c.8-.9 1.9-1.5 3.1-1.7-.4 1.2-.3 2.5.3 3.6 1-.5 1.8-1.2 2.4-2.1.1 1.2.5 2.3 1.2 3.2 1.1-1.1 1.8-2.5 2-4 .2 1.5.9 2.9 2 4 .7-.9 1.1-2 1.2-3.2.6.9 1.4 1.6 2.4 2.1.6-1.1.7-2.4.3-3.6 1.2.2 2.3.8 3.1 1.7v-3.4c.4 1.2 1.1 2.3 2.1 3.2.6-1.1.7-2.4.2-3.6 1.1-.2 2.2 0 3.3.5-.3-1.1-.9-2.1-1.8-2.9 1.1-.4 2.2-.5 3.4-.3-.4-1-.5-2.1-.4-3.2-.8.7-1.7 1.3-2.7 1.7-.2-1.1 0-2.2.5-3.2-1.1.3-2.1.8-3 1.5.1-1.1-.2-2.2-.8-3.2.8.1 1.6.2 2.4.3-.9-.7-1.6-1.7-2.1-2.9z" />
    </svg>
  );
}

function LanternIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden fill="none">
      <path
        d="M12 3c-2.2 0-4 1.6-4 3.6v1.2c0 .6-.2 1.2-.6 1.7l-1.2 1.5c-.4.5-.6 1.1-.6 1.7v5.6c0 1.4 2.7 2.4 6.4 2.4s6.4-1 6.4-2.4v-5.6c0-.6-.2-1.2-.6-1.7l-1.2-1.5c-.4-.5-.6-1.1-.6-1.7V6.6C16 4.6 14.2 3 12 3Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path d="M8.5 8.5h7M9 12h6M10 15.5h4" stroke="rgba(255,220,120,0.85)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12 2v1.2M10.2 21.2 11 23h2l.8-1.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <ellipse cx="12" cy="6.8" rx="3.2" ry="1.1" fill="rgba(255,210,90,0.55)" />
    </svg>
  );
}

function FlagBadge({ label, className, style }: { label: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={className} style={style} aria-hidden>
      {label}
    </span>
  );
}

export function flairBadgeLabel(kind: FlairBadgeKind): string {
  const labels: Record<FlairBadgeKind, string> = {
    maple: "Maple",
    us: "US",
    lantern: "Lantern",
    blossom: "Blossom",
    fr: "France",
    es: "Spain",
    aurora: "Aurora",
    gb: "UK",
    au: "Australia",
    jp: "Japan",
    kr: "Korea",
  };
  return labels[kind];
}

export function FlairBadgeIcon({ kind, className = "", style, size = "md" }: FlairBadgeIconProps) {
  const cls = `flair-badge-icon ${sizeClass[size]} ${className}`.trim();

  switch (kind) {
    case "maple":
      return <MapleIcon className={`${cls} text-red-600 dark:text-red-400`} style={style} />;
    case "lantern":
      return <LanternIcon className={`${cls} text-red-600 dark:text-red-300`} style={style} />;
    case "us":
      return <FlagBadge label="🇺🇸" className={cls} style={style} />;
    case "blossom":
      return <FlagBadge label="🌸" className={cls} style={style} />;
    case "fr":
      return <FlagBadge label="🇫🇷" className={cls} style={style} />;
    case "es":
      return <FlagBadge label="🇪🇸" className={cls} style={style} />;
    case "aurora":
      return <FlagBadge label="❄️" className={cls} style={style} />;
    case "gb":
      return <FlagBadge label="🇬🇧" className={cls} style={style} />;
    case "au":
      return <FlagBadge label="🇦🇺" className={cls} style={style} />;
    case "jp":
      return <FlagBadge label="🇯🇵" className={cls} style={style} />;
    case "kr":
      return <FlagBadge label="🇰🇷" className={cls} style={style} />;
    default:
      return null;
  }
}
