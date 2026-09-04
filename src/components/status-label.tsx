import type { PublicStatus, ValidationState } from "@/types/project";
import { getDictionary, type Locale } from "@/i18n";

const validationMarks: Record<ValidationState, string> = {
  passed: "✓",
  pending: "○",
  failed: "!",
  "not-applicable": "—",
  blocked: "×",
};

export function StatusLabel({ status, locale }: { status: PublicStatus; locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <span className="status-label" data-status={status}>
      <span className="status-label__mark" aria-hidden="true" />
      {dictionary.statusLabels[status]}
    </span>
  );
}

export function ValidationLabel({ state, locale }: { state: ValidationState; locale: Locale }) {
  const dictionary = getDictionary(locale);
  return (
    <span className="validation-label" data-state={state}>
      <span className="validation-label__mark" aria-hidden="true">
        {validationMarks[state]}
      </span>
      <span>{dictionary.validationLabels[state]}</span>
    </span>
  );
}
