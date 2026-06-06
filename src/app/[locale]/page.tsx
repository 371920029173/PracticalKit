import { HomeHero } from "@/components/HomeHero";
import { HomeProSection } from "@/components/HomeProSection";
import { RecentToolsSection } from "@/components/RecentToolsSection";
import { ToolFinder } from "@/components/ToolFinder";
import { ToolTile } from "@/components/ToolTile";
import { createHomeMetadata } from "@/lib/seo-metadata";
import { TOOLS } from "@/lib/tools-registry";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = createHomeMetadata();

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");

  return (
    <div className="space-y-16">
      <HomeHero />
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
      <HomeProSection />
      <RecentToolsSection />
      <section id="tools" className="scroll-mt-28 space-y-6">
        <div>
          <p className="section-kicker">{t("heroBadge")}</p>
          <h2 className="section-title mt-2">{t("toolsSectionTitle")}</h2>
        </div>
        <div className="stagger-fade grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool) => (
            <ToolTile
              key={tool.segment}
              href={`/${tool.segment}/`}
              navKey={tool.navKey}
              title={nav(tool.navKey)}
              blurb={t(`toolBlurbs.${tool.navKey}` as "toolBlurbs.pdf")}
              isNew={tool.isNew}
            />
          ))}
          <ToolTile
            href="/blog/"
            navKey="blog"
            title={nav("blog")}
            blurb={t("toolBlurbs.blog")}
          />
        </div>
      </section>
    </div>
  );
}
