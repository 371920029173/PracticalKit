import type { Metadata } from "next";
import "./globals.css";
import { mono, sans } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const googleVerification =
  typeof process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION === "string" &&
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim().length > 0
    ? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim()
    : undefined;

const yandexVerification =
  typeof process.env.NEXT_PUBLIC_YANDEX_VERIFICATION === "string" &&
  process.env.NEXT_PUBLIC_YANDEX_VERIFICATION.trim().length > 0
    ? process.env.NEXT_PUBLIC_YANDEX_VERIFICATION.trim()
    : undefined;

const bingVerification =
  typeof process.env.NEXT_PUBLIC_BING_VERIFICATION === "string" &&
  process.env.NEXT_PUBLIC_BING_VERIFICATION.trim().length > 0
    ? process.env.NEXT_PUBLIC_BING_VERIFICATION.trim()
    : undefined;

const verificationMeta: Metadata["verification"] =
  googleVerification || yandexVerification || bingVerification
    ? {
        ...(googleVerification ? { google: googleVerification } : {}),
        ...(yandexVerification ? { yandex: yandexVerification } : {}),
        ...(bingVerification
          ? { other: { "msvalidate.01": bingVerification } }
          : {}),
      }
    : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Browser tools`,
    template: `%s`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "online tools",
    "pdf tools",
    "image converter",
    "json formatter",
    "text diff",
    "base converter",
    "developer utilities",
  ],
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(verificationMeta ? { verification: verificationMeta } : {}),
  openGraph: {
    title: `${SITE_NAME} — Browser tools`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Browser tools`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pk-theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})()`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
