import { developmentSystems } from "@/data/development-systems";
import { getSystemProgress } from "@/lib/progress";
import { MilestoneTrack } from "@/components/milestone-track";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel } from "@/components/status-label";

export function SystemStatusGrid() {
  return (
    <section className="section-block section-block--surface" id="systems" aria-labelledby="systems-heading">
      <div className="shell">
        <SectionHeader
          headingId="systems-heading"
          index="03"
          eyebrow="Development systems"
          title="A living ledger of systems."
          description="Published state and measured milestones for each development system."
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
                    <StatusLabel status={system.status} />
                  </div>
                  <p>{system.description}</p>
                  {system.publicNote ? <small>{system.publicNote}</small> : null}
                </div>
                <div className="system-ledger__measure">
                  {progress && system.milestones ? (
                    <MilestoneTrack label={system.title} milestones={system.milestones} />
                  ) : (
                    <p>{system.progressNote ?? "Milestone progress is not published."}</p>
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
