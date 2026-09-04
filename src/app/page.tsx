import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { en } from "@/i18n/en";
import { getLanguageAlternates } from "@/i18n";

export const metadata: Metadata = {
  title: { absolute: en.metadata.homeTitle },
  description: en.metadata.homeDescription,
  alternates: { canonical: "/", languages: getLanguageAlternates("/") },
  openGraph: { title: en.metadata.socialTitle, description: en.metadata.socialDescription, type: "website", url: "/", locale: "en_US" },
  twitter: { card: "summary_large_image", title: en.metadata.socialTitle, description: en.metadata.socialDescription },
};

export default function Home() {
  return <HomePage locale="en" />;
}
