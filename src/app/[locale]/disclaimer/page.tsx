import { createPageMetadata } from "@/lib/seo-metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = createPageMetadata("disclaimer", (m) => m.disclaimerPage.title);

export default async function DisclaimerPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("disclaimerPage");
  return (
    <div className="prose prose-slate max-w-3xl space-y-4 dark:prose-invert">
      <h1 className="text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="legal-emphasis text-slate-900 dark:text-zinc-100">
        {t("p1")}
      </p>
      <p className="text-slate-700 dark:text-zinc-300">{t("p2")}</p>
      <p className="text-slate-700 dark:text-zinc-300">{t("p3")}</p>
    </div>
  );
}
