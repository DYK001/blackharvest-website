import { projectStatus } from "@/data/project-status";
import { SectionHeader } from "@/components/section-header";
import { StatusLabel, ValidationLabel } from "@/components/status-label";

export function CurrentTask() {
  return (
    <section className="section-block shell" id="validation" aria-labelledby="validation-heading">
      <SectionHeader
        headingId="validation-heading"
        index="04"
        eyebrow="Current task / Validation"
        title="Proof before certainty."
        description="Each verification stage is reported independently."
      />
      <div className="validation-dossier" data-status={projectStatus.currentTask.status}>
        <div className="validation-dossier__heading">
          <p className="micro-label">Current verification record</p>
          <h3>{projectStatus.currentTask.title}</h3>
          <StatusLabel status={projectStatus.currentTask.status} />
        </div>
        <div className="validation-table" role="list" aria-label="Validation stages">
          {projectStatus.currentTask.validation.map((step, index) => (
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
      </div>
    </section>
  );
}
