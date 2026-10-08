import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthResultToast } from "@/components/auth-result-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "বাজার দর — প্রতিদিনের বাজারদর",
  description: "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের প্রতিদিনের বাজারদর এক নজরে।",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>
        <AuthResultToast />
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}
