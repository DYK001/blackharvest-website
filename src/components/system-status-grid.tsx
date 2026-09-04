import { getSystemProgress } from "@/lib/progress";
import { MilestoneTrack } from "@/components/milestone-track";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel } from "@/components/status-label";
import { getDictionary, getLocalizedDevelopmentSystems, type Locale } from "@/i18n";

export function SystemStatusGrid({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const developmentSystems = getLocalizedDevelopmentSystems(locale);
  return (
    <section className="section-block section-block--surface" id="systems" aria-labelledby="systems-heading">
      <div className="shell">
        <SectionHeader
          headingId="systems-heading"
          index="03"
          eyebrow={dictionary.developmentSystems.eyebrow}
          title={dictionary.developmentSystems.title}
          description={dictionary.developmentSystems.description}
        />
        <ol className="systems-ledger">
          {developmentSystems.map((system, index) => {
            const progress = getSystemProgress(system);

            return (
              <li className="system-ledger" data-status={system.status} key={system.id}>
                <span className="system-ledger__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="system-ledger__identity">
                  <div className="system-ledger__topline">
                    <h3>{system.title}</h3>
                    <StatusLabel status={system.status} locale={locale} />
                  </div>
                  <p>{system.description}</p>
                  {system.publicNote ? <small>{system.publicNote}</small> : null}
                </div>
                <div className="system-ledger__measure">
                  {progress && system.milestones ? (
                    <MilestoneTrack label={system.title} milestones={system.milestones} locale={locale} />
                  ) : (
                    <p>{system.progressNote ?? dictionary.developmentSystems.unpublishedProgress}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
