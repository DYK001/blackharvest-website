import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { getLanguageAlternates } from "@/i18n";
import { ko } from "@/i18n/ko";

export const metadata: Metadata = {
  title: { absolute: ko.metadata.homeTitle },
  description: ko.metadata.homeDescription,
  alternates: { canonical: "/ko", languages: getLanguageAlternates("/") },
  openGraph: { title: ko.metadata.socialTitle, description: ko.metadata.socialDescription, type: "website", url: "/ko", locale: "ko_KR" },
  twitter: { card: "summary_large_image", title: ko.metadata.socialTitle, description: ko.metadata.socialDescription },
};

export default function KoreanHome() {
  return <HomePage locale="ko" />;
}
