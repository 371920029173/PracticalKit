import type { Messages } from "@/lib/messages";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export type ToolEditorialMode = "local" | "thirdParty" | "fileMedia";

type NavKey = keyof Messages["nav"];

export async function ToolEditorialFooter({
  mode,
  navKey,
}: {
  mode: ToolEditorialMode;
  navKey: NavKey;
}) {
  const t = await getTranslations("toolEditorial");
  const nav = await getTranslations("nav");
  const toolName = nav(navKey);
  const base = `modes.${mode}`;

  return (
    <section
      className="mt-12 border-t border-slate-200/80 pt-10 dark:border-zinc-700/80"
      aria-labelledby="tool-editorial-heading"
    >
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
          {t("scopeLabel")}
        </p>
        <h2
          id="tool-editorial-heading"
          className="mt-2 text-xl font-semibold text-slate-900 dark:text-white"
        >
          {t(`${base}.title`)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          {t("intro", { toolName })}
        </p>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          <p>{t(`${base}.p1`, { toolName })}</p>
          <p>{t(`${base}.p2`, { toolName })}</p>
          <p>{t(`${base}.p3`, { toolName })}</p>
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
          {t("linksTitle")}
        </p>
        <nav
          className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-300"
          aria-label={t("linksTitle")}
        >
          <Link href="/privacy/" prefetch={false}>
            {t("linkPrivacy")}
          </Link>
          <Link href="/terms/" prefetch={false}>
            {t("linkTerms")}
          </Link>
          <Link href="/disclaimer/" prefetch={false}>
            {t("linkDisclaimer")}
          </Link>
          <Link href="/about/" prefetch={false}>
            {t("linkAbout")}
          </Link>
          <Link href="/blog/" prefetch={false}>
            {t("linkBlog")}
          </Link>
        </nav>
      </div>
    </section>
  );
}
