import { MediaFrame } from "@/components/media/media-frame";
import { getDictionary, getLocalizedHomepageMedia, type Locale } from "@/i18n";

export function MediaShowcase({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const assets = getLocalizedHomepageMedia(locale);

  if (assets.length === 0) return null;

  return (
    <section
      className="section-block media-showcase"
      id="media"
      aria-labelledby="media-heading"
    >
      <div className="shell">
        <header className="media-showcase__heading">
          <p className="eyebrow">
            <span aria-hidden="true" /> {dictionary.fieldRecords.eyebrow}
          </p>
          <h2 id="media-heading">{dictionary.fieldRecords.title}</h2>
          <p>{dictionary.fieldRecords.description}</p>
        </header>

        <div className="media-showcase__layout" data-count={assets.length}>
          {assets.map((asset, index) => (
            <MediaFrame
              asset={asset}
              locale={locale}
              className={index === 0 ? "media-frame--primary" : undefined}
              sizes={
                index === 0
                  ? "(max-width: 800px) 100vw, 68vw"
                  : "(max-width: 800px) 100vw, 32vw"
              }
              key={asset.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
