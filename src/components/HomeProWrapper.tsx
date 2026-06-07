"use client";

import { totalVisitCount } from "@/lib/recent-tools";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";

export function HomeProWrapper({ children }: { children: ReactNode }) {
  const t = useTranslations("home");
  const [visits, setVisits] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const count = totalVisitCount();
    setVisits(count);
    setOpen(count < 3);
  }, []);

  if (visits >= 3 && !open) {
    return (
      <section className="scroll-mt-24">
        <button
          type="button"
          className="btn-ghost w-full justify-center text-sm"
          onClick={() => setOpen(true)}
        >
          {t("proExpand")}
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {visits >= 3 ? (
        <div className="flex justify-end">
          <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
            {t("proCollapse")}
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}
