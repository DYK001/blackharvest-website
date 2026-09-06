import type { MetadataRoute } from "next";
import { developmentLogEntries } from "@/data/development-log";
import { absoluteUrl } from "@/lib/site-url";
import { getLanguageAlternates, localizedPath, locales } from "@/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...developmentLogEntries.map((entry) => `/devlog/${entry.slug}`)];
  return paths.flatMap((path) => locales.map((locale) => ({
    url: absoluteUrl(localizedPath(locale, path)),
    alternates: { languages: Object.fromEntries(Object.entries(getLanguageAlternates(path)).map(([language, value]) => [language, absoluteUrl(value)])) },
  })));
}
