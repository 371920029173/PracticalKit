"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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

export default function CidrPage() {
  const t = useTranslations("cidrPage");
  const [input, setInput] = useState("192.168.1.0/24");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  function run() {
    setErr("");
    setOut("");
    try {
      const m = input.trim().match(/^([\d.]+)\/(\d{1,2})$/);
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
      setOut(
        [
          `${t("network")}: ${fmtIPv4(network)}`,
          `${t("broadcast")}: ${fmtIPv4(broadcast)}`,
          `${t("mask")}: ${fmtIPv4(mask)}`,
          `${t("hosts")}: ${usable} (${t("hostsTotal")}: ${total})`,
        ].join("\n")
      );
    } catch {
      setErr(t("invalid"));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <input
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("input")}
      />
      <button type="button" className="btn-primary" onClick={run}>
        {t("run")}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {out || "—"}
      </pre>
    </div>
  );
}
