import { RecentToolsSection } from "@/components/RecentToolsSection";
import { Link } from "@/i18n/navigation";
import { createHomeMetadata } from "@/lib/seo-metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = createHomeMetadata();

const tiles = [
  ["/blog/", "blog"],
  ["/pdf/", "pdf"],
  ["/image/", "image"],
  ["/data/", "data"],
  ["/text/", "text"],
  ["/qr/", "qr"],
  ["/units/", "units"],
  ["/time/", "time"],
  ["/function-plot/", "functionPlot"],
  ["/calc/", "calc"],
  ["/encoding/", "encoding"],
  ["/password/", "password"],
  ["/translate/", "translate"],
  ["/code/", "code"],
  ["/money/", "money"],
  ["/markdown/", "markdown"],
  ["/random/", "random"],
  ["/json-diff/", "jsonDiff"],
  ["/hash/", "hash"],
  ["/jwt/", "jwt"],
  ["/cron/", "cron"],
  ["/http-status/", "httpStatus"],
  ["/api-snippet/", "apiSnippet"],
  ["/csv-json/", "csvJson"],
  ["/slug/", "slug"],
  ["/html-entities/", "htmlEntities"],
  ["/css-min/", "cssMin"],
  ["/lorem/", "lorem"],
  ["/unicode/", "unicode"],
  ["/cidr/", "cidr"],
  ["/color/", "color"],
  ["/video-gif/", "videoGif"],
  ["/audio/", "audio"],
  ["/regex/", "regex"],
  ["/text-diff/", "textDiff"],
  ["/base-convert/", "baseConvert"],
  ["/rgbv3d/", "rgbv3d"],
] as const;

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");

  return (
    <div className="space-y-12">
      <section className="glass-panel relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {t("welcomeTitle")}
          </h1>
          <p className="text-lg leading-relaxed text-slate-600 dark:text-zinc-300">
            {t("welcomeLead")}
          </p>
          <p className="text-sm text-slate-500 dark:text-zinc-500">
            {t("privacyNote")}
          </p>
          <div className="glass-panel mt-6 space-y-3 rounded-2xl p-5 text-left text-base leading-relaxed text-slate-700 dark:text-zinc-200">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("editorialTitle")}
            </h2>
            <p className="whitespace-pre-wrap">{t("editorialBody")}</p>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              {t("editorialUpdate")}
            </p>
          </div>
          <Link
            href="#tools"
            prefetch={false}
            className="btn-primary mt-2 inline-flex shadow-indigo-500/30"
          >
            {t("welcomeCta")}
          </Link>
        </div>
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/20"
          aria-hidden
        />
      </section>

      <RecentToolsSection />

      <section id="tools" className="scroll-mt-24 space-y-5">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {t("toolsSectionTitle")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tiles.map(([href, key]) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className="btn-motion glass-panel group flex min-h-[5.5rem] flex-col items-stretch justify-center gap-2 rounded-2xl px-5 py-5 text-left text-slate-800 ring-1 ring-transparent hover:ring-indigo-500/20 dark:text-zinc-100"
            >
              <span className="text-lg font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
                {nav(key)}
              </span>
              <span className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {t(`toolBlurbs.${key}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
