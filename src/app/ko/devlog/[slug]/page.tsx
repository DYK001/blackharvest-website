import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DevlogPage } from "@/components/devlog-page";
import { developmentLogEntries, getDevelopmentLogEntry } from "@/data/development-log";
import { getLanguageAlternates, getLocalizedDevelopmentLog } from "@/i18n";
import { ko } from "@/i18n/ko";

export function generateStaticParams() {
  return developmentLogEntries.map((entry) => ({ slug: entry.slug }));
}

interface KoreanDevlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: KoreanDevlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLocalizedDevelopmentLog("ko", slug);

  if (!entry) return { title: ko.metadata.devlogNotFoundTitle };

  const path = `/devlog/${entry.slug}`;
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/ko${path}`, languages: getLanguageAlternates(path) },
    openGraph: { title: entry.title, description: entry.summary, type: "article", url: `/ko${path}`, locale: "ko_KR", images: [] },
    twitter: { card: "summary", title: entry.title, description: entry.summary, images: [] },
  };
}

export default async function KoreanDevelopmentLogPage({ params }: KoreanDevlogPageProps) {
  const { slug } = await params;
  const sourceEntry = getDevelopmentLogEntry(slug);
  const entry = getLocalizedDevelopmentLog("ko", slug);

  if (!sourceEntry || !entry) notFound();

  return <DevlogPage entry={entry} sourceEntry={sourceEntry} locale="ko" />;
}
