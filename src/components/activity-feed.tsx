import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel, ValidationLabel } from "@/components/status-label";
import { getDictionary, getLocalizedActivities, localizedPath, type Locale } from "@/i18n";

export function ActivityFeed({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const activityEntries = getLocalizedActivities(locale);
  return (
    <section className="section-block shell" id="activity" aria-labelledby="activity-heading">
      <SectionHeader
        headingId="activity-heading"
        index="06"
        eyebrow={dictionary.activity.eyebrow}
        title={dictionary.activity.title}
        description={dictionary.activity.description}
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
              <StatusLabel status={entry.status} locale={locale} />
              <span className="activity-entry__validation">
                {dictionary.activity.validation} <ValidationLabel state={entry.validation} locale={locale} />
                {entry.validationDetail ? <small>{entry.validationDetail}</small> : null}
              </span>
            </div>
            {entry.devlogSlug ? (
              <Link className="text-link" href={localizedPath(locale, `/devlog/${entry.devlogSlug}`)} aria-label={`${dictionary.activity.readLogLabel}: ${entry.title}`}>
                {dictionary.activity.readLog} <span aria-hidden="true">↗</span>
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
