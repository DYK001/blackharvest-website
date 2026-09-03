import { projectStatus } from "@/data/project-status";
import { StatusLabel } from "@/components/status-label";

export function DevelopmentStatus() {
  return (
    <section className="development-focus" id="development" aria-labelledby="development-heading">
      <div className="shell development-focus__layout">
        <div className="development-focus__phase" aria-hidden="true">
          <span>01</span>
          <small>Active focus</small>
        </div>

        <article className="development-focus__copy">
          <p className="eyebrow"><span aria-hidden="true" /> Active development focus</p>
          <p className="development-focus__area">{projectStatus.currentMajorFocus}</p>
          <h2 id="development-heading">{projectStatus.currentTask.title}</h2>
          <p className="development-focus__summary">{projectStatus.currentTask.summary}</p>
          <div className="development-focus__next">
            <span>Next action</span>
            <p>{projectStatus.currentTask.nextAction}</p>
          </div>
        </article>

        <aside className="development-focus__record" aria-label="Current development state">
          <div className="development-focus__gate">
            <span>Current verification gate</span>
            <StatusLabel status={projectStatus.currentTask.status} />
          </div>
          <div className="development-focus__project-state">
            <span>Overall project</span>
            <StatusLabel status={projectStatus.overallStatus} />
          </div>
          <p className="development-focus__progress-note">{projectStatus.progressNote}</p>
        </aside>
      </div>
    </section>
  );
}
