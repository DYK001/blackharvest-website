import { SectionHeader } from "@/components/section-header";
import { StatusLabel, ValidationLabel } from "@/components/status-label";
import { getDictionary, getLocalizedProjectStatus, type Locale } from "@/i18n";

export function CurrentTask({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const projectStatus = getLocalizedProjectStatus(locale);
  return (
    <section className="section-block shell" id="validation" aria-labelledby="validation-heading">
      <SectionHeader
        headingId="validation-heading"
        index="04"
        eyebrow={dictionary.currentTask.eyebrow}
        title={dictionary.currentTask.title}
        description={dictionary.currentTask.description}
      />
      <div className="validation-dossier" data-status={projectStatus.currentTask.status}>
        <div className="validation-dossier__heading">
          <p className="micro-label">{dictionary.currentTask.record}</p>
          <h3>{projectStatus.currentTask.title}</h3>
          <StatusLabel status={projectStatus.currentTask.status} locale={locale} />
        </div>
        <div className="validation-table" role="list" aria-label={dictionary.currentTask.stagesLabel}>
          {projectStatus.currentTask.validation.map((step, index) => (
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
      </div>
    </section>
  );
}
