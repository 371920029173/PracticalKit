"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function validField(v: string, min: number, max: number): boolean {
  if (v === "*") return true;
  return v.split(",").every((part) => {
    if (/^\d+$/.test(part)) {
      const n = Number(part);
      return n >= min && n <= max;
    }
    if (/^\*\/\d+$/.test(part)) {
      const step = Number(part.slice(2));
      return step > 0;
    }
    if (/^\d+-\d+(\/\d+)?$/.test(part)) {
      const [range] = part.split("/");
      const [a, b] = range!.split("-").map(Number);
      return a >= min && b <= max && a <= b;
    }
    return false;
  });
}

export default function CronPage() {
  const t = useTranslations("cronPage");
  const [expr, setExpr] = useState("*/5 * * * *");
  const [err, setErr] = useState("");
  const [rows, setRows] = useState<{ k: string; v: string }[]>([]);

  function run() {
    setErr("");
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      setErr(t("invalid"));
      return;
    }
    const [mi, ho, dm, mo, dw] = parts;
    if (
      !validField(mi!, 0, 59) ||
      !validField(ho!, 0, 23) ||
      !validField(dm!, 1, 31) ||
      !validField(mo!, 1, 12) ||
      !validField(dw!, 0, 7)
    ) {
      setErr(t("invalid"));
      return;
    }
    setRows([
      { k: t("min"), v: mi! },
      { k: t("hour"), v: ho! },
      { k: t("dom"), v: dm! },
      { k: t("mon"), v: mo! },
      { k: t("dow"), v: dw! },
    ]);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        placeholder={t("expr")}
      />
      <button type="button" className="btn-primary" onClick={run}>
        {t("run")}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
          {t("explain")}
        </p>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">—</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {rows.map((r) => (
              <li key={r.k}>
                <span className="font-medium">{r.k}:</span> <code>{r.v}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
