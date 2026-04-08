import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const googleVerification =
  typeof process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION === "string" &&
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim().length > 0
    ? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim()
    : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Browser tools`,
    template: `%s`,
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
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
