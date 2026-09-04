import Link from "next/link";
import { getDictionary, localizedPath, type Locale } from "@/i18n";

export function SiteHeader({
  backHref,
  backLabel,
  locale,
  pagePath,
}: {
  backHref?: string;
  backLabel?: string;
  locale: Locale;
  pagePath: string;
}) {
  const dictionary = getDictionary(locale);
  const homePath = localizedPath(locale, "/");
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="wordmark" href={`${homePath}#top`} aria-label={dictionary.navigation.homeLabel}>
          <span className="wordmark__sigil" aria-hidden="true">
            <span>BH</span>
          </span>
          <span className="wordmark__name">Black Harvest</span>
        </Link>

        <div className="site-header__controls">
          {backHref && backLabel ? (
            <Link className="header-return" href={backHref}>
              <span aria-hidden="true">←</span> {backLabel}
            </Link>
          ) : (
            <nav aria-label={dictionary.navigation.primaryLabel}>
              <Link href={`${homePath}#development`}><span className="nav-label--long">{dictionary.navigation.development}</span><span className="nav-label--short">{dictionary.navigation.developmentShort}</span></Link>
              <Link href={`${homePath}#roadmap`}>{dictionary.navigation.roadmap}</Link>
              <Link href={`${homePath}#project`}>{dictionary.navigation.systems}</Link>
              <Link href={`${homePath}#devlog`}><span className="nav-label--long">{dictionary.navigation.devlog}</span><span className="nav-label--short">{dictionary.navigation.devlogShort}</span></Link>
            </nav>
          )}
          <nav className="language-switch" aria-label={dictionary.languageSwitch.label}>
            <Link href={localizedPath("en", pagePath)} hrefLang="en" lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link>
            <span aria-hidden="true">/</span>
            <Link href={localizedPath("ko", pagePath)} hrefLang="ko" lang="ko" aria-current={locale === "ko" ? "page" : undefined}>KO</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
