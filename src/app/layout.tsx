import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/public-sans";
import "./globals.css";
import { Providers } from "@/lib/query/providers";
import { THEME_SCRIPT } from "@/lib/theme/theme-script";

export const metadata: Metadata = {
  title: { default: "InterviewCall Console", template: "%s · InterviewCall Console" },
  description: "Staff console for InterviewCall entrance tests.",
  robots: { index: false, follow: false },
  icons: { icon: "/images/ic-logo.png", apple: "/images/ic-logo.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint. Without it, a dark-mode user would see a white flash on every load. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
