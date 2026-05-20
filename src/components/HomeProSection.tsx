import { Link } from "@/i18n/navigation";
import { NAV_GROUPS } from "@/lib/nav-groups";
import { getTranslations } from "next-intl/server";

const CATEGORY_IDS = [
  "documents",
  "media",
  "dataDev",
  "daily",
  "math",
  "extras",
] as const;

export async function HomeProSection() {
  const t = await getTranslations("homePro");
  const nav = await getTranslations("nav");
  const tGroup = await getTranslations("navGroup");

  const groups = NAV_GROUPS.filter((g) =>
    (CATEGORY_IDS as readonly string[]).includes(g.id),
  );

  return (
    <div className="space-y-14">
      <section className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["trust1Title", "trust1Body"],
            ["trust2Title", "trust2Body"],
            ["trust3Title", "trust3Body"],
          ] as const
        ).map(([titleKey, bodyKey]) => (
          <div
            key={titleKey}
            className="glass-panel rounded-2xl border border-indigo-100/80 p-5 dark:border-indigo-900/40"
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {t(titleKey)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
              {t(bodyKey)}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t("categoriesTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-zinc-400">
            {t("categoriesLead")}
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="glass-panel rounded-2xl p-5 ring-1 ring-slate-200/60 dark:ring-zinc-700/60"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {tGroup(group.labelKey)}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                {t(`category_${group.id}` as "category_documents")}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-indigo-100 hover:text-indigo-900 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-indigo-950 dark:hover:text-indigo-200"
                    >
                      {nav(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-3xl px-6 py-8 sm:px-10">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {t("howTitle")}
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {(
            [
              ["step1Title", "step1Body"],
              ["step2Title", "step2Body"],
              ["step3Title", "step3Body"],
            ] as const
          ).map(([titleKey, bodyKey], i) => (
            <li key={titleKey} className="space-y-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t(titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {t(bodyKey)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {t("faqTitle")}
        </h2>
        <div className="space-y-3">
          {(
            [
              ["faq1Q", "faq1A"],
              ["faq2Q", "faq2A"],
              ["faq3Q", "faq3A"],
            ] as const
          ).map(([qKey, aKey]) => (
            <details
              key={qKey}
              className="glass-panel group rounded-2xl px-5 py-4 open:ring-1 open:ring-indigo-500/20"
            >
              <summary className="cursor-pointer list-none font-medium text-slate-900 marker:content-none dark:text-white">
                {t(qKey)}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {t(aKey)}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
