import { getSystemProgress } from "@/lib/progress";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel } from "@/components/status-label";
import { MilestoneTrack } from "@/components/milestone-track";
import { getDictionary, getLocalizedDevelopmentSystem, getLocalizedRoadmap, type Locale } from "@/i18n";

export function Roadmap({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const roadmapItems = getLocalizedRoadmap(locale);
  return (
    <section className="section-block section-block--roadmap" id="roadmap" aria-labelledby="roadmap-heading" data-campaign={dictionary.roadmap.campaign}>
      <div className="shell">
        <SectionHeader
          headingId="roadmap-heading"
        index="05"
        eyebrow={dictionary.roadmap.eyebrow}
        title={dictionary.roadmap.title}
        description={dictionary.roadmap.description}
        />
        <ol className="roadmap-ledger">
          {roadmapItems.map((item, index) => {
            const system = item.kind === "system" ? getLocalizedDevelopmentSystem(locale, item.systemId) : undefined;

            if (item.kind === "system" && !system) {
              throw new Error(`Roadmap references an unknown system: ${item.systemId}`);
            }

            const description = system?.description ?? (item.kind === "standalone" ? item.description : "");
            const status = system?.status ?? (item.kind === "standalone" ? item.status : "planned");
            const progress = system ? getSystemProgress(system) : null;
            const progressNote = system?.progressNote ?? (item.kind === "standalone" ? item.progressNote : "");

            return (
            <li data-status={status} key={item.id}>
              <div className="roadmap-ledger__heading">
                <span className="roadmap-ledger__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <StatusLabel status={status} locale={locale} />
              </div>
              <div className="roadmap-ledger__main">
                <h3><span>{item.title}</span></h3>
                {item.kind === "standalone" ? <p>{description}</p> : null}
              </div>
              <div className="roadmap-ledger__state">
                {progress && system?.milestones ? (
                  <MilestoneTrack label={item.title} milestones={system.milestones} compact locale={locale} />
                ) : (
                  <p>{progressNote}</p>
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
