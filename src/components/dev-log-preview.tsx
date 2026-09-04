import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel } from "@/components/status-label";
import { getDictionary, getLocalizedDevelopmentLogs, getLocalizedDevelopmentSystem, localizedPath, type Locale } from "@/i18n";

export function DevLogPreview({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const developmentLogEntries = getLocalizedDevelopmentLogs(locale);
  return (
    <section className="section-block shell" id="devlog" aria-labelledby="devlog-heading">
      <SectionHeader
        headingId="devlog-heading"
        index="07"
        eyebrow={dictionary.devlogPreview.eyebrow}
        title={dictionary.devlogPreview.title}
        description={dictionary.devlogPreview.description}
      />
      <div className="devlog-ledger">
        {developmentLogEntries.map((entry, index) => {
          const relatedSystems = entry.relatedSystemIds
            .map((systemId) => getLocalizedDevelopmentSystem(locale, systemId)?.title)
            .filter((title): title is string => Boolean(title));

          return (
            <article className="devlog-entry" data-featured={index === 0 || undefined} data-status={entry.status} key={entry.slug}>
              <div className="devlog-entry__index">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{entry.category}</small>
              </div>
              <div className="devlog-entry__copy">
                <div className="devlog-entry__topline">
                  <StatusLabel status={entry.status} locale={locale} />
                  {entry.publishedAt ? <time dateTime={entry.publishedAt}>{entry.publishedAt}</time> : null}
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
                <span className="devlog-entry__systems">{dictionary.devlogPreview.related}: {relatedSystems.join(" / ")}</span>
              </div>
              <Link className="text-link" href={localizedPath(locale, `/devlog/${entry.slug}`)}>
                {dictionary.devlogPreview.readJournal} <span aria-hidden="true">↗</span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
