import { HeroMedia } from "@/components/media/hero-media";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, type Locale } from "@/i18n";

export function Hero({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <section className="hero" aria-labelledby="hero-title">
      <a className="skip-link" href="#development">{dictionary.hero.skipLink}</a>
      <HeroMedia />
      <SiteHeader locale={locale} pagePath="/" />

      <div className="hero__content shell" id="top">
        <div className="hero__status">
          <span aria-hidden="true">I</span>
          <span>{dictionary.hero.status}</span>
        </div>
        <h1 id="hero-title" aria-label="Black Harvest"><span>Black</span><span>Harvest</span></h1>
        <p className="hero__subtitle">{dictionary.hero.subtitle}</p>
        <p className="hero__copy">{dictionary.hero.description}</p>
        <div className="hero__actions">
          <a className="button button--primary" href="#development"><span>{dictionary.hero.viewDevelopment}</span><span aria-hidden="true">↓</span></a>
          <a className="button button--secondary" href="#project"><span>{dictionary.hero.exploreProject}</span><span aria-hidden="true">↘</span></a>
        </div>
      </div>

      <div className="hero__footer shell" aria-hidden="true">
        <span>{dictionary.hero.developmentRecord}</span>
        <span className="hero__line" />
        <span>{dictionary.hero.officialJournal}</span>
      </div>
    </section>
  );
}
