import { Fragment } from "react";
import { DevlogMedia } from "@/components/media/devlog-media";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusLabel, ValidationLabel } from "@/components/status-label";
import { getDictionary, getLocalizedDevelopmentSystem, localizedPath, type Locale } from "@/i18n";
import type { DevelopmentLogEntry } from "@/types/project";

export function DevlogPage({
  entry,
  sourceEntry,
  locale,
}: {
  entry: DevelopmentLogEntry;
  sourceEntry: DevelopmentLogEntry;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const relatedSystems = entry.relatedSystemIds
    .map((systemId) => getLocalizedDevelopmentSystem(locale, systemId)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <div className="locale-root" data-locale={locale} lang={locale}>
      <SiteHeader
        locale={locale}
        pagePath={`/devlog/${entry.slug}`}
        backHref={`${localizedPath(locale, "/")}#devlog`}
        backLabel={dictionary.navigation.backToDevlog}
      />
      <main className="devlog-page" data-status={entry.status}>
        <article className="shell devlog-article">
          <header className="devlog-page__heading">
            <div className="devlog-page__kicker">
              <p className="eyebrow"><span aria-hidden="true" /> {dictionary.devlogArticle.journal}</p>
              <span>{entry.category}</span>
            </div>
            <h1>
              {entry.title.split(/(\/\s*[^\s/]+-[^\s/]+)/g).map((segment, index) =>
                segment.includes("-") && segment.trimStart().startsWith("/") ? (
                  <span className="devlog-title__compound" key={`${segment}-${index}`}>
                    {segment}
                  </span>
                ) : (
                  segment
                ),
              )}
            </h1>
            <p className="devlog-page__summary">{entry.summary}</p>
            <div className="devlog-page__meta">
              <div><span>{dictionary.devlogArticle.workState}</span><StatusLabel status={entry.status} locale={locale} /></div>
              <div><span>{dictionary.devlogArticle.validation}</span><ValidationLabel state={entry.validationState} locale={locale} /></div>
              {entry.publishedAt ? <div><span>{dictionary.devlogArticle.published}</span><time dateTime={entry.publishedAt}>{entry.publishedAt}</time></div> : null}
              <div><span>{dictionary.devlogArticle.relatedSystems}</span><strong>{relatedSystems.join(" / ")}</strong></div>
            </div>
          </header>

          <DevlogMedia slug={entry.slug} locale={locale} />

          <div className="devlog-page__body">
            <div className="devlog-page__sections">
              {entry.sections.map((section, index) => (
                <Fragment key={`${entry.slug}-${index}`}>
                  <section>
                    <span className="devlog-page__section-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h2>{section.heading}</h2>
                      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  </section>
                  <DevlogMedia
                    slug={entry.slug}
                    sectionHeading={sourceEntry.sections[index]?.heading}
                    locale={locale}
                  />
                </Fragment>
              ))}
            </div>

            {entry.validation ? (
              <aside className="devlog-page__validation" aria-labelledby={`validation-record-heading-${locale}`}>
                <p className="eyebrow"><span aria-hidden="true" /> {dictionary.devlogArticle.evidence}</p>
                <h2 id={`validation-record-heading-${locale}`}>{dictionary.devlogArticle.validationRecord}</h2>
                <div className="validation-table" role="list" aria-label={dictionary.devlogArticle.validationStages}>
                  {entry.validation.map((step, index) => (
                    <div className="validation-row" data-state={step.state} role="listitem" key={step.kind}>
                      <span className="validation-row__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <span>{dictionary.validationKinds[step.kind]}</span>
                        {step.detail ? <small>{step.detail}</small> : null}
                      </div>
                      <ValidationLabel state={step.state} locale={locale} />
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </article>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
