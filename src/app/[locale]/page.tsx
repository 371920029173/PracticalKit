import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

const tiles = [
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
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-6 py-12 shadow-lg dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 sm:px-10">
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

      <section id="tools" className="scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {t("toolsSectionTitle")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(([href, key]) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className="btn-motion rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:border-indigo-600"
            >
              {nav(key)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
