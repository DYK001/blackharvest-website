import Link from "next/link";
import { developmentLogEntries } from "@/data/development-log";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel } from "@/components/status-label";
import { getDevelopmentSystem } from "@/data/development-systems";

export function DevLogPreview() {
  return (
    <section className="section-block shell" id="devlog" aria-labelledby="devlog-heading">
      <SectionHeader
        headingId="devlog-heading"
        index="07"
        eyebrow="Development log"
        title="Field notes from the build."
        description="Implementation notes, validation evidence, and unresolved work."
      />
      <div className="devlog-ledger">
        {developmentLogEntries.map((entry, index) => {
          const relatedSystems = entry.relatedSystemIds
            .map((systemId) => getDevelopmentSystem(systemId)?.title)
            .filter((title): title is string => Boolean(title));

          return (
            <article className="devlog-entry" data-featured={index === 0 || undefined} data-status={entry.status} key={entry.slug}>
              <div className="devlog-entry__index">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{entry.category}</small>
              </div>
              <div className="devlog-entry__copy">
                <div className="devlog-entry__topline">
                  <StatusLabel status={entry.status} />
                  {entry.publishedAt ? <time dateTime={entry.publishedAt}>{entry.publishedAt}</time> : null}
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
                <span className="devlog-entry__systems">Related: {relatedSystems.join(" / ")}</span>
              </div>
              <Link className="text-link" href={`/devlog/${entry.slug}`}>
                Read journal <span aria-hidden="true">↗</span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
