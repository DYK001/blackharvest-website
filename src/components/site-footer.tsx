import Link from "next/link";
import { getDictionary, localizedPath, type Locale } from "@/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const homePath = localizedPath(locale, "/");
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <span className="site-footer__title">Black Harvest</span>
          <span>{dictionary.footer.inDevelopment}</span>
        </div>
        <nav aria-label={dictionary.navigation.footerLabel}>
          <Link href={`${homePath}#development`}>{dictionary.navigation.development}</Link>
          <Link href={`${homePath}#roadmap`}>{dictionary.navigation.roadmap}</Link>
          <Link href={`${homePath}#devlog`}>{dictionary.navigation.devlog}</Link>
          <Link href={`${homePath}#top`}>{dictionary.navigation.top} <span aria-hidden="true">↑</span></Link>
        </nav>
      </div>
    </footer>
  );
}
