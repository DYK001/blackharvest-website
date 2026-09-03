import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "@/data/public-development-data";
import "./globals.css";
import "@/styles/site-shell.css";
import "@/styles/home.css";
import "@/styles/devlog.css";
import "@/styles/media.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-blackharvest-display",
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-blackharvest-body",
});

function normalizeSiteUrl(value: string | undefined) {
  const url = value?.trim();
  if (!url) return undefined;

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL) ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Black Harvest | Development",
    template: "%s | Black Harvest",
  },
  description: "The official development record for BlackHarvest, a grounded medieval open-world survival project.",
  openGraph: {
    title: "Black Harvest | Development",
    description: "Follow the published development state of BlackHarvest, a grounded medieval open-world survival project.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Harvest | Development",
    description: "Follow the published development state of BlackHarvest.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
