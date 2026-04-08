import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("privacyPage");
  return (
    <div className="prose prose-slate max-w-3xl space-y-4 dark:prose-invert">
      <h1 className="text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="legal-emphasis text-slate-900 dark:text-zinc-100">
        {t("p1")}
      </p>
      <p className="text-slate-700 dark:text-zinc-300">{t("p2")}</p>
      <p className="text-slate-700 dark:text-zinc-300">{t("p3")}</p>
      <p className="legal-emphasis text-slate-900 dark:text-zinc-100">
        {t("p4")}
      </p>
      <p className="text-slate-700 dark:text-zinc-300">{t("p5")}</p>
      <p className="legal-emphasis text-slate-900 dark:text-zinc-100">
        {t("p6")}
      </p>
      <p className="text-slate-700 dark:text-zinc-300">{t("p7")}</p>
    </div>
  );
}
