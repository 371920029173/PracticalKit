"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function parseIPv4(ip: string): number {
  const p = ip.split(".").map((x) => Number(x.trim()));
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    throw new Error("bad ip");
  }
  return (((p[0]! << 24) | (p[1]! << 16) | (p[2]! << 8) | p[3]!) >>> 0) as number;
}

function fmtIPv4(n: number): string {
  const x = n >>> 0;
  return [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255].join(
    "."
  );
}

const DEF_CIDR = "192.168.1.0/24";

function formatCidrResult(
  trimmed: string,
  t: (k: string) => string
): { ok: true; text: string } | { ok: false } {
  try {
    const m = trimmed.match(/^([\d.]+)\/(\d{1,2})$/);
    if (!m) throw new Error("format");
    const prefix = Number(m[2]);
    if (prefix < 0 || prefix > 32) throw new Error("prefix");
    const ip = parseIPv4(m[1]!);
    const mask =
      prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const inv = (~mask >>> 0) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | inv) >>> 0;
    const hostBits = 32 - prefix;
    const total =
      hostBits >= 32 ? 4294967296 : Math.pow(2, hostBits);
    const usable =
      prefix === 32
        ? 1
        : prefix === 31
          ? 2
          : Math.max(0, total - 2);
    return {
      ok: true,
      text: [
        `${t("network")}: ${fmtIPv4(network)}`,
        `${t("broadcast")}: ${fmtIPv4(broadcast)}`,
        `${t("mask")}: ${fmtIPv4(mask)}`,
        `${t("hosts")}: ${usable} (${t("hostsTotal")}: ${total})`,
      ].join("\n"),
    };
  } catch {
    return { ok: false };
  }
}

export default function CidrPage() {
  const t = useTranslations("cidrPage");
  const [input, setInput] = useState(DEF_CIDR);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  const run = useCallback(() => {
    setErr("");
    setOut("");
    const r = formatCidrResult(input.trim(), t);
    if (r.ok) setOut(r.text);
    else setErr(t("invalid"));
  }, [input, t]);

  const resetAndRun = useCallback(() => {
    setInput(DEF_CIDR);
    setErr("");
    const r = formatCidrResult(DEF_CIDR, t);
    if (r.ok) setOut(r.text);
    else setErr(t("invalid"));
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <input
        className="tool-field max-w-md font-mono"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("input")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      {err && (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      )}
      <pre className="tool-pre-out font-mono text-sm">{out || "—"}</pre>
    </div>
  );
}
