import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Tools App",
  description: "Free AI tools and newsletter resources for faster work.",
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
        {children}
        <footer className="border-t border-slate-200 bg-white px-5 py-8 text-slate-950 sm:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Tools App</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Free AI tools and a weekly digest for sharper creator workflows.
              </p>
            </div>
            <SubscribeWidget variant="footer" source="footer" />
          </div>
        </footer>
      </body>
    </html>
  );
}
