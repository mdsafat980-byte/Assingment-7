import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import { AuthResultToast } from "@/components/auth-result-toast";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getTickerProducts } from "@/lib/market-server";

import "./globals.css";

export const metadata: Metadata = {
  title: "বাজার দর — প্রতিদিনের বাজারদর",
  description: "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের প্রতিদিনের বাজারদর এক নজরে।",
};

/**
 * The nav and the ticker are resolved here rather than inside every page, so
 * the navigation is present in the very first HTML frame and is fetched once
 * per request instead of once per page mount.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [categories, tickerProducts] = await Promise.all([
    getCategories(),
    getTickerProducts(),
  ]);

  return (
    <html lang="bn">
      <body>
        <AuthResultToast />
        <SiteHeader categories={categories} tickerProducts={tickerProducts} />
        {children}
        <SiteFooter />
        <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}