import type {
  ActivityEntry,
  DevelopmentLogEntry,
  DevelopmentSystem,
  ProjectStatus,
  PublicStatus,
  ValidationState,
  ValidationStep,
} from "@/types/project";

export interface PublicDevelopmentData {
  projectStatus: ProjectStatus;
  developmentSystems: DevelopmentSystem[];
  activityEntries: ActivityEntry[];
  developmentLogEntries: DevelopmentLogEntry[];
}

const publicStatuses: ReadonlySet<PublicStatus> = new Set([
  "active-development",
  "planned",
  "foundation",
  "in-development",
  "implemented",
  "validation",
  "validated",
  "blocked",
  "complete",
  "on-hold",
]);

const invalidCompletionValidationStates: ReadonlySet<ValidationState> = new Set([
  "pending",
  "failed",
  "blocked",
]);

function validateValidationSteps(
  steps: readonly ValidationStep[] | undefined,
  context: string,
): string[] {
  if (!steps) return [];

  const issues: string[] = [];
  const kinds = new Set<string>();

  for (const step of steps) {
    if (kinds.has(step.kind)) {
      issues.push(`Duplicate validation kind in ${context}: ${step.kind}`);
    }
    kinds.add(step.kind);
  }

  return issues;
}

function hasIncompleteValidation(steps: readonly ValidationStep[] | undefined) {
  return steps?.some((step) =>
    invalidCompletionValidationStates.has(step.state),
  );
}

export function validateDevelopmentSystems(
  systems: readonly DevelopmentSystem[],
): string[] {
  const issues: string[] = [];
  const systemIds = new Set<string>();

  for (const system of systems) {
    if (systemIds.has(system.id)) {
      issues.push(`Duplicate development system id: ${system.id}`);
    }
    systemIds.add(system.id);

    if (!publicStatuses.has(system.status)) {
      issues.push(`Unknown system status in ${system.id}: ${system.status}`);
    }

    issues.push(
      ...validateValidationSteps(system.validation, `system ${system.id}`),
    );

    const milestones = system.milestones ?? [];
    const milestoneIds = new Set<string>();

    if (system.progressMode === "milestones" && milestones.length === 0) {
      issues.push(`Milestone progress requires milestones: ${system.id}`);
    }

    for (const milestone of milestones) {
      if (milestoneIds.has(milestone.id)) {
        issues.push(`Duplicate milestone id in ${system.id}: ${milestone.id}`);
      }
      milestoneIds.add(milestone.id);

      issues.push(
        ...validateValidationSteps(
          milestone.validation,
          `milestone ${system.id}/${milestone.id}`,
        ),
      );

      if (
        milestone.state === "complete" &&
        hasIncompleteValidation(milestone.validation)
      ) {
        issues.push(
          `Complete milestone has incomplete validation: ${system.id}/${milestone.id}`,
        );
      }
    }

    if (
      system.status === "complete" &&
      milestones.some((milestone) => milestone.state !== "complete")
    ) {
      issues.push(`Complete system contains incomplete milestones: ${system.id}`);
    }

    if (
      ["complete", "validated"].includes(system.status) &&
      hasIncompleteValidation(system.validation)
    ) {
      issues.push(
        `Complete or validated system has incomplete validation: ${system.id}`,
      );
    }
  }

  return issues;
}

export function validatePublicDevelopmentData(
  data: PublicDevelopmentData,
): string[] {
  const issues = validateDevelopmentSystems(data.developmentSystems);
  const systemIds = new Set(data.developmentSystems.map((system) => system.id));
  const logSlugs = new Set<string>();
  const activityIds = new Set<string>();

  if (!publicStatuses.has(data.projectStatus.overallStatus)) {
    issues.push(
      `Unknown project status: ${data.projectStatus.overallStatus}`,
    );
  }

  if (!publicStatuses.has(data.projectStatus.currentTask.status)) {
    issues.push(
      `Unknown current task status: ${data.projectStatus.currentTask.status}`,
    );
  }

  issues.push(
    ...validateValidationSteps(
      data.projectStatus.currentTask.validation,
      "current task",
    ),
  );

  if (
    ["complete", "validated"].includes(data.projectStatus.currentTask.status) &&
    hasIncompleteValidation(data.projectStatus.currentTask.validation)
  ) {
    issues.push("Complete or validated current task has incomplete validation");
  }

  for (const entry of data.developmentLogEntries) {
    if (logSlugs.has(entry.slug)) {
      issues.push(`Duplicate development log slug: ${entry.slug}`);
    }
    logSlugs.add(entry.slug);

    if (entry.relatedSystemIds.length === 0) {
      issues.push(`Development log has no related systems: ${entry.slug}`);
    }

    for (const systemId of entry.relatedSystemIds) {
      if (!systemIds.has(systemId)) {
        issues.push(
          `Development log references unknown system: ${entry.slug}/${systemId}`,
        );
      }
    }

    issues.push(
      ...validateValidationSteps(
        entry.validation,
        `development log ${entry.slug}`,
      ),
    );

    if (
      entry.validationState === "passed" &&
      hasIncompleteValidation(entry.validation)
    ) {
      issues.push(
        `Passed development log has incomplete validation: ${entry.slug}`,
      );
    }

    if (
      ["complete", "validated"].includes(entry.status) &&
      (invalidCompletionValidationStates.has(entry.validationState) ||
        hasIncompleteValidation(entry.validation))
    ) {
      issues.push(
        `Complete or validated development log has incomplete validation: ${entry.slug}`,
      );
    }
  }

  for (const entry of data.activityEntries) {
    if (activityIds.has(entry.id)) {
      issues.push(`Duplicate activity id: ${entry.id}`);
    }
    activityIds.add(entry.id);

    if (entry.devlogSlug && !logSlugs.has(entry.devlogSlug)) {
      issues.push(
        `Activity references unknown development log: ${entry.id}/${entry.devlogSlug}`,
      );
    }

    if (
      ["complete", "validated"].includes(entry.status) &&
      invalidCompletionValidationStates.has(entry.validation)
    ) {
      issues.push(
        `Complete or validated activity has incomplete validation: ${entry.id}`,
      );
    }
  }

  return issues;
}

export function assertDevelopmentDataIntegrity(
  systems: readonly DevelopmentSystem[],
) {
  const issues = validateDevelopmentSystems(systems);
  if (issues.length > 0) {
    throw new Error(`Invalid public development data:\n${issues.join("\n")}`);
  }
}

export function assertPublicDevelopmentDataIntegrity(
  data: PublicDevelopmentData,
) {
  const issues = validatePublicDevelopmentData(data);
  if (issues.length > 0) {
    throw new Error(`Invalid public development data:\n${issues.join("\n")}`);
  }
}
