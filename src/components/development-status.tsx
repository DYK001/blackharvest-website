import { StatusLabel } from "@/components/status-label";
import { getDictionary, getLocalizedProjectStatus, type Locale } from "@/i18n";

export function DevelopmentStatus({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const projectStatus = getLocalizedProjectStatus(locale);
  return (
    <section className="development-focus" id="development" aria-labelledby="development-heading">
      <div className="shell development-focus__layout">
        <div className="development-focus__phase" aria-hidden="true">
          <span>01</span>
          <small>{dictionary.developmentFocus.phase}</small>
        </div>

        <article className="development-focus__copy">
          <p className="eyebrow"><span aria-hidden="true" /> {dictionary.developmentFocus.eyebrow}</p>
          <p className="development-focus__area">{projectStatus.currentMajorFocus}</p>
          <h2 id="development-heading">{projectStatus.currentTask.title}</h2>
          <p className="development-focus__summary">{projectStatus.currentTask.summary}</p>
          <div className="development-focus__next">
            <span>{dictionary.developmentFocus.nextAction}</span>
            <p>{projectStatus.currentTask.nextAction}</p>
          </div>
        </article>

        <aside className="development-focus__record" aria-label={dictionary.developmentFocus.stateLabel}>
          <div className="development-focus__gate">
            <span>{dictionary.developmentFocus.currentGate}</span>
            <StatusLabel status={projectStatus.currentTask.status} locale={locale} />
          </div>
          <div className="development-focus__project-state">
            <span>{dictionary.developmentFocus.overallProject}</span>
            <StatusLabel status={projectStatus.overallStatus} locale={locale} />
          </div>
          <p className="development-focus__progress-note">{projectStatus.progressNote}</p>
        </aside>
      </div>
    </section>
  );
}
