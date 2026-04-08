import { JsonLd } from "@/components/JsonLd";
import { SiteChrome } from "@/components/SiteChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import { loadMessages } from "@/lib/messages";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const messages = await loadMessages(params.locale);
  return (
    <ThemeProvider>
      <JsonLd />
      <SiteChrome locale={params.locale} messages={messages}>
        {children}
      </SiteChrome>
    </ThemeProvider>
  );
}
