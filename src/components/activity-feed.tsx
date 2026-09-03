import Link from "next/link";
import { activityEntries } from "@/data/activity";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel, ValidationLabel } from "@/components/status-label";

export function ActivityFeed() {
  return (
    <section className="section-block shell" id="activity" aria-labelledby="activity-heading">
      <SectionHeader
        headingId="activity-heading"
        index="06"
        eyebrow="Recent activity"
        title="Dispatches from development."
        description="Verified results and known implementation states, ordered without invented dates."
      />
      <div className="activity-feed">
        {activityEntries.map((entry, index) => (
          <article className="activity-entry" key={entry.id}>
            <span className="activity-entry__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div className="activity-entry__date">
              {entry.date ? <time dateTime={entry.date}>{entry.date}</time> : <span>{entry.orderLabel}</span>}
              <span>{entry.category}</span>
            </div>
            <div className="activity-entry__copy">
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
            </div>
            <div className="activity-entry__meta">
              <StatusLabel status={entry.status} />
              <span className="activity-entry__validation">
                Validation <ValidationLabel state={entry.validation} />
                {entry.validationDetail ? <small>{entry.validationDetail}</small> : null}
              </span>
            </div>
            {entry.devlogSlug ? (
              <Link className="text-link" href={`/devlog/${entry.devlogSlug}`} aria-label={`Read development log: ${entry.title}`}>
                Read log <span aria-hidden="true">↗</span>
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
