"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const WEAK = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "111111",
  "password1",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "sunshine",
  "princess",
  "football",
  "iloveyou",
  "000000",
  "123123",
  "654321",
]);

function charsetSize(pwd: string): number {
  let n = 0;
  if (/[a-z]/.test(pwd)) n += 26;
  if (/[A-Z]/.test(pwd)) n += 26;
  if (/\d/.test(pwd)) n += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) n += 33;
  return n;
}

function audit(pwd: string) {
  const len = pwd.length;
  const pool = charsetSize(pwd);
  const entropy = pool > 0 && len > 0 ? Math.round(len * Math.log2(pool)) : 0;
  let score = 0;
  if (len >= 8) score += 1;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
  if (/(.)\1{2,}/.test(pwd)) score -= 1;
  if (/^(123|abc|qwe)/i.test(pwd)) score -= 1;
  if (WEAK.has(pwd.toLowerCase())) score = 0;
  score = Math.max(0, Math.min(6, score));
  return { len, pool, entropy, score, weak: WEAK.has(pwd.toLowerCase()) };
}

export default function PasswordAuditPage() {
  const t = useTranslations("passwordAuditPage");
  const [pwd, setPwd] = useState("");
  const [ran, setRan] = useState(false);

  const result = useMemo(() => (ran && pwd ? audit(pwd) : null), [ran, pwd]);

  const labelKey = result
    ? result.weak
      ? "labelWeak"
      : result.score <= 2
        ? "labelFair"
        : result.score <= 4
          ? "labelGood"
          : "labelStrong"
    : null;

  const run = useCallback(() => setRan(true), []);
  const resetAndRun = useCallback(() => {
    setPwd(t("sample"));
    setRan(true);
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <input
        className="tool-field w-full font-mono"
        type="password"
        autoComplete="off"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder={t("placeholder")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} busy={false} />
      {result ? (
        <dl className="glass-panel animate-fade-up grid gap-3 rounded-2xl p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">{t("length")}</dt>
            <dd className="mt-1 text-lg font-semibold">{result.len}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">{t("charset")}</dt>
            <dd className="mt-1 text-lg font-semibold">{result.pool}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">{t("entropy")}</dt>
            <dd className="mt-1 text-lg font-semibold">{result.entropy} bits</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">{t("rating")}</dt>
            <dd className="mt-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {labelKey ? t(labelKey) : "—"}
            </dd>
          </div>
          {result.weak ? (
            <div className="sm:col-span-2 text-sm text-rose-600 dark:text-rose-400">{t("commonWarning")}</div>
          ) : null}
        </dl>
      ) : null}
      <p className="text-xs text-slate-500 dark:text-zinc-500">{t("privacy")}</p>
    </div>
  );
}
