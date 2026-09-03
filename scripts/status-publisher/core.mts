import {
  validatePublicDevelopmentData,
  type PublicDevelopmentData,
} from "../../src/lib/validate-development-data.ts";
import { getSystemProgress } from "../../src/lib/progress.ts";
import type {
  DevelopmentLogEntry,
  ValidationKind,
  ValidationStep,
} from "../../src/types/project.ts";
import {
  formatSchemaError,
  statusUpdatePayloadSchema,
  type PublicationHistory,
  type StatusUpdatePayload,
  type ValidationInput,
} from "./schema.mts";
import {
  clonePublicDevelopmentData,
  type DataFileKey,
} from "./data-store.mts";

export class PublisherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublisherError";
  }
}

const validationKinds: Array<{
  key: keyof ValidationInput;
  kind: ValidationKind;
}> = [
  { key: "implementation", kind: "Implementation" },
  { key: "compile", kind: "Compile" },
  { key: "automatedTest", kind: "Automated Test" },
  { key: "manualValidation", kind: "Manual Validation" },
];

const unsafePublicTextPattern = /(?:[A-Za-z]:\\|\/Users\/|\/home\/|file:\/\/|<|>|[\u0000-\u0008\u000B\u000C\u000E-\u001F])/;

export interface PublicationHistoryEntry {
  updateId: string;
  summary: string;
  appliedAt: string;
  changedSystems: string[];
  changedMilestones: string[];
}

export interface PublicationPlan {
  payload: StatusUpdatePayload;
  previousData: PublicDevelopmentData;
  nextData: PublicDevelopmentData;
  changedKeys: DataFileKey[];
  summaryLines: string[];
  historyEntry: PublicationHistoryEntry;
}

function validationStepFromInput(
  kind: ValidationKind,
  value: NonNullable<ValidationInput[keyof ValidationInput]>,
): ValidationStep {
  if (typeof value === "string") return { kind, state: value };
  return {
    kind,
    state: value.state,
    ...(value.detail ? { detail: value.detail } : {}),
  };
}

function validationStepsFromInput(input: ValidationInput): ValidationStep[] {
  return validationKinds.flatMap(({ key, kind }) => {
    const value = input[key];
    return value === undefined ? [] : [validationStepFromInput(kind, value)];
  });
}

function mergeValidationSteps(
  current: ValidationStep[] | undefined,
  input: ValidationInput,
) {
  const replacements = new Map(
    validationStepsFromInput(input).map((step) => [step.kind, step]),
  );
  const currentByKind = new Map(
    (current ?? []).map((step) => [step.kind, step]),
  );

  return validationKinds.flatMap(({ kind }) => {
    const step = replacements.get(kind) ?? currentByKind.get(kind);
    return step ? [step] : [];
  });
}

function inspectPublicStrings(value: unknown, trail = "data"): string[] {
  if (typeof value === "string") {
    return unsafePublicTextPattern.test(value)
      ? [`Unsafe public text at ${trail}`]
      : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      inspectPublicStrings(item, `${trail}[${index}]`),
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      inspectPublicStrings(item, `${trail}.${key}`),
    );
  }

  return [];
}

export function validateDataForPublishing(data: PublicDevelopmentData) {
  const shapeIssues: string[] = [];
  if (!data || typeof data !== "object") {
    return ["Public development data must be an object"];
  }
  if (!data.projectStatus || typeof data.projectStatus !== "object") {
    shapeIssues.push("projectStatus must be an object");
  }
  if (!Array.isArray(data.developmentSystems)) {
    shapeIssues.push("developmentSystems must be an array");
  }
  if (!Array.isArray(data.activityEntries)) {
    shapeIssues.push("activityEntries must be an array");
  }
  if (!Array.isArray(data.developmentLogEntries)) {
    shapeIssues.push("developmentLogEntries must be an array");
  }
  if (shapeIssues.length > 0) return shapeIssues;

  try {
    return [
      ...validatePublicDevelopmentData(data),
      ...inspectPublicStrings(data),
    ];
  } catch (error) {
    return [
      `Public development data has an invalid shape: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }
}

export function assertDataIsPublishable(data: PublicDevelopmentData) {
  const issues = validateDataForPublishing(data);
  if (issues.length > 0) {
    throw new PublisherError(
      `Public development data failed integrity checks:\n- ${issues.join("\n- ")}`,
    );
  }
}

export function parseStatusUpdate(value: unknown): StatusUpdatePayload {
  const result = statusUpdatePayloadSchema.safeParse(value);
  if (!result.success) {
    throw new PublisherError(
      `Invalid update payload:\n${formatSchemaError(result.error)}`,
    );
  }
  return result.data;
}

function formatProgress(
  system: PublicDevelopmentData["developmentSystems"][number],
) {
  const progress = getSystemProgress(system);
  if (!progress) return "status-only; no percentage";
  return `${progress.completed}/${progress.total} complete (${progress.percentage}%)`;
}

function setOptionalText(
  target: Record<string, unknown>,
  key: string,
  value: string | null | undefined,
) {
  if (value === undefined) return;
  if (value === null) {
    delete target[key];
  } else {
    target[key] = value;
  }
}

export function createPublicationPlan(
  rawPayload: unknown,
  currentData: PublicDevelopmentData,
  history: PublicationHistory,
  appliedAt = new Date().toISOString(),
): PublicationPlan {
  const payload = parseStatusUpdate(rawPayload);
  assertDataIsPublishable(currentData);

  if (history.entries.some((entry) => entry.updateId === payload.updateId)) {
    throw new PublisherError(
      `Update ID has already been applied: ${payload.updateId}`,
    );
  }

  const nextData = clonePublicDevelopmentData(currentData);
  const changedKeys = new Set<DataFileKey>();
  const changedSystems = new Set<string>();
  const changedMilestones = new Set<string>();
  const summaryLines: string[] = [];

  for (const change of payload.changes) {
    if (change.type === "milestone") {
      const system = nextData.developmentSystems.find(
        (candidate) => candidate.id === change.systemId,
      );
      const priorSystem = currentData.developmentSystems.find(
        (candidate) => candidate.id === change.systemId,
      );
      if (!system || !priorSystem) {
        throw new PublisherError(`Unknown system ID: ${change.systemId}`);
      }

      const milestone = system.milestones?.find(
        (candidate) => candidate.id === change.milestoneId,
      );
      if (!milestone) {
        throw new PublisherError(
          `Unknown milestone ID: ${change.systemId}/${change.milestoneId}`,
        );
      }

      const priorMilestone = structuredClone(milestone);
      const priorState = milestone.state;
      if (change.state !== undefined) milestone.state = change.state;
      setOptionalText(
        milestone as unknown as Record<string, unknown>,
        "publicNote",
        change.publicNote,
      );
      setOptionalText(
        milestone as unknown as Record<string, unknown>,
        "updatedAt",
        change.updatedAt,
      );
      if (change.validation === null) {
        delete milestone.validation;
      } else if (change.validation !== undefined) {
        milestone.validation = mergeValidationSteps(
          milestone.validation,
          change.validation,
        );
      }

      if (JSON.stringify(priorMilestone) === JSON.stringify(milestone)) {
        throw new PublisherError(
          `Milestone operation produces no data change: ${change.systemId}/${change.milestoneId}`,
        );
      }

      changedKeys.add("developmentSystems");
      changedSystems.add(change.systemId);
      changedMilestones.add(`${change.systemId}/${change.milestoneId}`);
      summaryLines.push(
        `Milestone ${change.systemId}/${change.milestoneId}: ${priorState} → ${milestone.state}; system progress ${formatProgress(priorSystem)} → ${formatProgress(system)}.`,
      );
      continue;
    }

    if (change.type === "current-focus") {
      const priorProjectStatus = structuredClone(nextData.projectStatus);
      const priorTask = nextData.projectStatus.currentTask;
      nextData.projectStatus.currentMajorFocus = change.title;
      nextData.projectStatus.currentTask = {
        title: change.title,
        status: change.status,
        summary: change.explanation,
        nextAction: change.nextAction,
        validation: validationStepsFromInput(change.validation),
      };
      setOptionalText(
        nextData.projectStatus as unknown as Record<string, unknown>,
        "lastUpdated",
        change.updatedAt,
      );
      if (
        JSON.stringify(priorProjectStatus) ===
        JSON.stringify(nextData.projectStatus)
      ) {
        throw new PublisherError(
          "Current-focus operation produces no data change",
        );
      }
      changedKeys.add("projectStatus");
      summaryLines.push(
        `Current focus: ${priorTask.title} (${priorTask.status}) → ${change.title} (${change.status}).`,
      );
      continue;
    }

    if (change.type === "activity") {
      if (nextData.activityEntries.some((entry) => entry.id === change.id)) {
        throw new PublisherError(`Activity ID already exists: ${change.id}`);
      }
      nextData.activityEntries.unshift({
        id: change.id,
        title: change.title,
        description: change.description,
        category: change.category,
        status: change.status,
        validation: change.validation,
        orderLabel: change.orderLabel,
        ...(change.validationDetail
          ? { validationDetail: change.validationDetail }
          : {}),
        ...(change.date ? { date: change.date } : {}),
        ...(change.relatedDevlogSlug
          ? { devlogSlug: change.relatedDevlogSlug }
          : {}),
      });
      changedKeys.add("activityEntries");
      summaryLines.push(
        `Activity added: ${change.id} (${change.status}, validation ${change.validation}).`,
      );
      continue;
    }

    const existingIndex = nextData.developmentLogEntries.findIndex(
      (entry) => entry.slug === change.slug,
    );

    if (change.mode === "add") {
      if (existingIndex !== -1) {
        throw new PublisherError(
          `Development log slug already exists: ${change.slug}`,
        );
      }
      const entry: DevelopmentLogEntry = {
        slug: change.slug,
        title: change.title,
        summary: change.summary,
        category: change.category,
        status: change.status,
        validationState: change.validationState,
        relatedSystemIds: change.relatedSystemIds,
        sections: change.sections,
        ...(change.validation
          ? { validation: validationStepsFromInput(change.validation) }
          : {}),
        ...(change.date ? { publishedAt: change.date } : {}),
      };
      nextData.developmentLogEntries.unshift(entry);
      change.relatedSystemIds.forEach((id) => changedSystems.add(id));
      summaryLines.push(
        `Development log added: ${change.slug} (${change.status}).`,
      );
    } else {
      if (existingIndex === -1) {
        throw new PublisherError(`Unknown development log slug: ${change.slug}`);
      }
      const entry = nextData.developmentLogEntries[existingIndex];
      const priorEntry = structuredClone(entry);
      if (change.title !== undefined) entry.title = change.title;
      if (change.summary !== undefined) entry.summary = change.summary;
      if (change.category !== undefined) entry.category = change.category;
      if (change.status !== undefined) entry.status = change.status;
      if (change.validationState !== undefined) {
        entry.validationState = change.validationState;
      }
      if (change.validation === null) {
        delete entry.validation;
      } else if (change.validation !== undefined) {
        entry.validation = mergeValidationSteps(
          entry.validation,
          change.validation,
        );
      }
      if (change.relatedSystemIds !== undefined) {
        entry.relatedSystemIds = change.relatedSystemIds;
      }
      if (change.sections !== undefined) entry.sections = change.sections;
      setOptionalText(
        entry as unknown as Record<string, unknown>,
        "publishedAt",
        change.date,
      );
      entry.relatedSystemIds.forEach((id) => changedSystems.add(id));
      if (JSON.stringify(priorEntry) === JSON.stringify(entry)) {
        throw new PublisherError(
          `Development log operation produces no data change: ${change.slug}`,
        );
      }
      summaryLines.push(
        `Development log updated: ${change.slug} (${entry.status}).`,
      );
    }
    changedKeys.add("developmentLogEntries");
  }

  assertDataIsPublishable(nextData);

  return {
    payload,
    previousData: clonePublicDevelopmentData(currentData),
    nextData,
    changedKeys: [...changedKeys],
    summaryLines,
    historyEntry: {
      updateId: payload.updateId,
      summary: payload.summary,
      appliedAt,
      changedSystems: [...changedSystems],
      changedMilestones: [...changedMilestones],
    },
  };
}
