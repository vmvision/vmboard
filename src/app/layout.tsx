import { SiteHeader } from "@/components/layouts/site-header";
import { ThemeProvider } from "@/components/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import { fontMono, fontSans } from "@/lib/fonts";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickPublic } from "@/i18n/pick";
import type { Messages } from "global";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["board", "panel", "vps"],
  authors: [
    {
      name: "AprilNEA",
      url: "https://sku.moe",
    },
  ],
  creator: "AprilNEA",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@AprilNEA",
  },
  icons: {
    icon: "/icon.svg",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  const locale = await getLocale();
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = (await getMessages()) as Messages;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <NextTopLoader />
        <NextIntlClientProvider messages={pickPublic(messages)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              {children}
            </div>
            <TailwindIndicator />
          </ThemeProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
