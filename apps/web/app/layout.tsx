import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "GitHub User Search · Next.js",
  description: "Search GitHub users with filters, infinite scroll, and canvas avatars."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSans.className} bg-slate-50 text-slate-900 dark:bg-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
