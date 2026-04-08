import { createPageMetadata } from "@/lib/seo-metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = createPageMetadata("contact", (m) => m.contactPage.title);

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("contactPage");
  return (
    <div className="prose prose-slate max-w-3xl space-y-4 dark:prose-invert">
      <h1 className="text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="text-slate-700 dark:text-zinc-300">{t("p1")}</p>
      <p>
        <a
          href={`mailto:${t("email")}`}
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          {t("email")}
        </a>
      </p>
      <p className="text-slate-700 dark:text-zinc-300">{t("p2")}</p>
    </div>
  );
}
