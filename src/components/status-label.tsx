import type { PublicStatus, ValidationState } from "@/types/project";

const statusLabels: Record<PublicStatus, string> = {
  "active-development": "Active Development",
  planned: "Planned",
  foundation: "Foundation",
  "in-development": "In Development",
  implemented: "Implemented",
  validation: "Validation",
  validated: "Validated",
  blocked: "Blocked",
  complete: "Complete",
  "on-hold": "On Hold",
};

const validationLabels: Record<ValidationState, string> = {
  passed: "Pass",
  pending: "Pending",
  failed: "Failed",
  "not-applicable": "N/A",
  blocked: "Blocked",
};

const validationMarks: Record<ValidationState, string> = {
  passed: "✓",
  pending: "○",
  failed: "!",
  "not-applicable": "—",
  blocked: "×",
};

export function StatusLabel({ status }: { status: PublicStatus }) {
  return (
    <span className="status-label" data-status={status}>
      <span className="status-label__mark" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

export function ValidationLabel({ state }: { state: ValidationState }) {
  return (
    <span className="validation-label" data-state={state}>
      <span className="validation-label__mark" aria-hidden="true">
        {validationMarks[state]}
      </span>
      <span>{validationLabels[state]}</span>
    </span>
  );
}
