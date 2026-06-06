import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function HomeHero() {
  const t = await getTranslations("home");

  const stats = [
    { value: t("statTools"), label: t("statToolsLabel") },
    { value: t("statLangs"), label: t("statLangsLabel") },
    { value: t("statLocal"), label: t("statLocalLabel") },
  ] as const;

  return (
    <section className="glass-panel hero-mesh relative overflow-hidden rounded-[1.75rem] border border-white/40 px-6 py-10 sm:px-10 sm:py-14 dark:border-zinc-700/50">
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <p className="section-kicker">{t("heroBadge")}</p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] dark:text-white">
            {t("welcomeTitle")}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-zinc-300">
            {t("welcomeLead")}
          </p>
          <p className="text-sm text-slate-500 dark:text-zinc-500">{t("privacyNote")}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="#tools" prefetch={false} className="btn-primary">
              {t("welcomeCta")}
            </Link>
            <Link href="/blog/" prefetch={false} className="btn-ghost">
              {t("qualityCtaBlog")}
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((s) => (
            <div key={s.label} className="stat-pill">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {s.value}
              </span>
              <span className="text-sm text-slate-600 dark:text-zinc-400">{s.label}</span>
            </div>
          ))}
          <div className="glass-panel rounded-2xl border border-indigo-200/50 p-4 dark:border-indigo-900/40 sm:col-span-3 lg:col-span-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {t("editorialTitle")}
            </p>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
              {t("editorialBody").split("\n\n")[0]}
            </p>
            <Link
              href="/about/"
              prefetch={false}
              className="mt-3 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              {t("qualityCtaAbout")} →
            </Link>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15"
        aria-hidden
      />
    </section>
  );
}
