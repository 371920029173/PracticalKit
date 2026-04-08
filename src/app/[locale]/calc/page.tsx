"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { create, all } from "mathjs";

const math = create(all, {});

export default function CalcPage() {
  const t = useTranslations("calc");
  const [expr, setExpr] = useState("sqrt(16) + sin(pi/2)");
  const [out, setOut] = useState("");

  function run() {
    try {
      const r = math.evaluate(expr);
      setOut(typeof r === "object" && r !== null && "toString" in r ? String((r as { toString: () => string }).toString()) : String(r));
    } catch (e) {
      setOut(`Error: ${e}`);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
      <p className="text-sm text-zinc-500">{t("sciNote")}</p>
      <textarea
        className="min-h-28 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
      />
      <button
        type="button"
        onClick={run}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
      >
        =
      </button>
      <pre className="rounded-lg border border-zinc-800 bg-black/40 p-3 font-mono text-lg text-emerald-300">
        {out || "—"}
      </pre>
    </div>
  );
}
