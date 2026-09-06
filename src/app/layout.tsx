import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_KR, Noto_Serif_KR, Source_Sans_3 } from "next/font/google";
import "@/data/public-development-data";
import { en } from "@/i18n/en";
import "./globals.css";
import "@/styles/site-shell.css";
import "@/styles/home.css";
import "@/styles/devlog.css";
import "@/styles/media.css";
import "@/styles/i18n.css";
import "@/styles/motion.css";
import { siteUrl } from "@/lib/site-url";

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

const koreanDisplayFont = Noto_Serif_KR({
  weight: "variable",
  display: "swap",
  preload: false,
  variable: "--font-blackharvest-display-ko",
});

const koreanBodyFont = Noto_Sans_KR({
  weight: "variable",
  display: "swap",
  preload: false,
  variable: "--font-blackharvest-body-ko",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: en.metadata.homeTitle,
    template: "%s | Black Harvest",
  },
  description: en.metadata.homeDescription,
  openGraph: {
    title: en.metadata.socialTitle,
    description: en.metadata.socialDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: en.metadata.socialTitle,
    description: en.metadata.socialDescription,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${koreanDisplayFont.variable} ${koreanBodyFont.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
