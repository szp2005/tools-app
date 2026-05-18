import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Script from "next/script";
import { SubscribeWidget } from "@/components/SubscribeWidget";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const title = "Tools App — Free AI tools for solopreneurs";
const description = "Optimize prompts, get weekly digests, save hours every week. No signup wall.";
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  "ufpv__Iei4LAF7AAjhGwvgIeoncGze2Jmib95HVDNJw";
const cloudflareWebAnalyticsToken =
  process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN ??
  process.env.PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN ??
  "";
const shouldLoadCloudflareWebAnalytics = /^[a-f0-9]{32}$/i.test(cloudflareWebAnalyticsToken);

export const metadata: Metadata = {
  metadataBase: new URL("https://tools.toolrouteai.com"),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-slate-200 bg-white px-5 py-4 text-slate-950 sm:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-sm font-semibold text-slate-950 transition hover:text-violet-700">
              Tools App
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
              <Link href="/prompt-optimizer" className="transition hover:text-slate-950">
                Prompt Optimizer
              </Link>
              <Link href="/comparison" className="transition hover:text-slate-950">
                Comparison
              </Link>
              <Link href="/obsidian-templates" className="transition hover:text-slate-950">
                Obsidian Templates
              </Link>
              <Link href="/price-tracker" className="transition hover:text-slate-950">
                Price Tracker
              </Link>
              <Link href="/side-hustle-ideas" className="transition hover:text-slate-950">
                Side Hustle Ideas
              </Link>
              <Link href="/blog" className="transition hover:text-slate-950">
                Blog
              </Link>
              <Link href="/zh-cn" className="transition hover:text-slate-950">
                中文
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-slate-200 bg-white px-5 py-8 text-slate-950 sm:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Tools App</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Free AI tools and a weekly digest for sharper creator workflows.
              </p>
              <nav className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                <Link href="/prompt-optimizer" className="transition hover:text-slate-950">
                  Prompt Optimizer
                </Link>
                <Link href="/comparison" className="transition hover:text-slate-950">
                  Comparison
                </Link>
                <Link href="/obsidian-templates" className="transition hover:text-slate-950">
                  Obsidian Templates
                </Link>
                <Link href="/price-tracker" className="transition hover:text-slate-950">
                  Price Tracker
                </Link>
                <Link href="/side-hustle-ideas" className="transition hover:text-slate-950">
                  Side Hustle Ideas
                </Link>
                <Link href="/blog" className="transition hover:text-slate-950">
                  Blog
                </Link>
                <Link href="/zh-cn" className="transition hover:text-slate-950">
                  中文
                </Link>
              </nav>
            </div>
            <SubscribeWidget variant="footer" source="footer" />
          </div>
        </footer>
        {shouldLoadCloudflareWebAnalytics ? (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cloudflareWebAnalyticsToken })}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
