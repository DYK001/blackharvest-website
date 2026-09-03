import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { DevlogMedia } from "@/components/media/devlog-media";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusLabel, ValidationLabel } from "@/components/status-label";
import { developmentLogEntries, getDevelopmentLogEntry } from "@/data/development-log";
import { getDevelopmentSystem } from "@/data/development-systems";

export function generateStaticParams() {
  return developmentLogEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/devlog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = getDevelopmentLogEntry(slug);

  if (!entry) {
    return { title: "Development Log Not Found" };
  }

  return {
    title: entry.title,
    description: entry.summary,
    openGraph: { title: entry.title, description: entry.summary, type: "article", images: [] },
    twitter: { card: "summary", title: entry.title, description: entry.summary, images: [] },
  };
}

export default async function DevelopmentLogPage({ params }: PageProps<"/devlog/[slug]">) {
  const { slug } = await params;
  const entry = getDevelopmentLogEntry(slug);

  if (!entry) notFound();

  const relatedSystems = entry.relatedSystemIds
    .map((systemId) => getDevelopmentSystem(systemId)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <>
      <SiteHeader backHref="/#devlog" backLabel="Development log" />
      <main className="devlog-page" data-status={entry.status}>
        <article className="shell devlog-article">
          <header className="devlog-page__heading">
            <div className="devlog-page__kicker">
              <p className="eyebrow"><span aria-hidden="true" /> Development journal</p>
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
              <div><span>Work state</span><StatusLabel status={entry.status} /></div>
              <div><span>Validation</span><ValidationLabel state={entry.validationState} /></div>
              {entry.publishedAt ? <div><span>Published</span><time dateTime={entry.publishedAt}>{entry.publishedAt}</time></div> : null}
              <div><span>Related systems</span><strong>{relatedSystems.join(" / ")}</strong></div>
            </div>
          </header>

          <DevlogMedia slug={entry.slug} />

          <div className="devlog-page__body">
            <div className="devlog-page__sections">
              {entry.sections.map((section, index) => (
                <Fragment key={section.heading}>
                  <section>
                    <span className="devlog-page__section-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h2>{section.heading}</h2>
                      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  </section>
                  <DevlogMedia
                    slug={entry.slug}
                    sectionHeading={section.heading}
                  />
                </Fragment>
              ))}
            </div>

            {entry.validation ? (
              <aside className="devlog-page__validation" aria-labelledby="validation-record-heading">
                <p className="eyebrow"><span aria-hidden="true" /> Evidence</p>
                <h2 id="validation-record-heading">Validation record</h2>
                <div className="validation-table" role="list" aria-label="Development log validation stages">
                  {entry.validation.map((step, index) => (
                    <div className="validation-row" data-state={step.state} role="listitem" key={step.kind}>
                      <span className="validation-row__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <span>{step.kind}</span>
                        {step.detail ? <small>{step.detail}</small> : null}
                      </div>
                      <ValidationLabel state={step.state} />
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
