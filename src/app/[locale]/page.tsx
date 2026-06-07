import { HomeHero } from "@/components/HomeHero";
import { HomeContinuePanel } from "@/components/HomeContinuePanel";
import { HomeProSection } from "@/components/HomeProSection";
import { HomeProWrapper } from "@/components/HomeProWrapper";
import { HomeToolsGrid } from "@/components/HomeToolsGrid";
import { ToolFinder } from "@/components/ToolFinder";
import { createHomeMetadata } from "@/lib/seo-metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = createHomeMetadata();

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");

  return (
    <div className="space-y-12">
      <HomeHero />
      <HomeContinuePanel />
      <section className="scroll-mt-28 space-y-4">
        <div>
          <p className="section-kicker">{t("searchKicker")}</p>
          <h2 className="section-title mt-2">{t("searchSectionTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">
            {t("searchSectionLead")}
          </p>
        </div>
        <ToolFinder variant="bar" />
      </section>
      <section id="tools" className="scroll-mt-28 space-y-6">
        <div>
          <p className="section-kicker">{t("heroBadge")}</p>
          <h2 className="section-title mt-2">{t("toolsSectionTitle")}</h2>
        </div>
        <HomeToolsGrid />
      </section>
      <HomeProWrapper>
        <HomeProSection />
      </HomeProWrapper>
    </div>
  );
}
