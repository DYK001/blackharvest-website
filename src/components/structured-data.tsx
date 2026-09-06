import { projectStatus } from "@/data/project-status";
import { absoluteUrl } from "@/lib/site-url";
import { localizedPath, type Locale } from "@/i18n";
import type { DevelopmentLogEntry } from "@/types/project";

export function StructuredData({ locale, entry }: { locale: Locale; entry?: DevelopmentLogEntry }) {
  const data = entry ? {
    "@context": "https://schema.org", "@type": "Article",
    headline: entry.title, description: entry.summary, inLanguage: locale,
    url: absoluteUrl(localizedPath(locale, `/devlog/${entry.slug}`)),
    ...(entry.publishedAt ? { datePublished: entry.publishedAt } : {}),
  } : {
    "@context": "https://schema.org", "@type": "WebSite",
    name: projectStatus.name, description: projectStatus.projectType,
    inLanguage: locale, url: absoluteUrl(localizedPath(locale, "/")),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
