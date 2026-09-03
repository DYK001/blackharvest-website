import { z } from "zod";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const unsafePublicTextPattern = /(?:[A-Za-z]:\\|\/Users\/|\/home\/|file:\/\/|<|>|[\u0000-\u0008\u000B\u000C\u000E-\u001F])/;

const identifier = z
  .string()
  .min(1)
  .max(100)
  .regex(idPattern, "must use lowercase kebab-case");

const publicText = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLength)
    .refine(
      (value) => !unsafePublicTextPattern.test(value),
      "must be plain public text without HTML, control characters, or machine paths",
    );

export const publicStatusSchema = z.enum([
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

export const milestoneStateSchema = z.enum([
  "planned",
  "in-development",
  "implemented",
  "validation",
  "blocked",
  "complete",
  "on-hold",
]);

export const validationStateSchema = z.enum([
  "passed",
  "pending",
  "failed",
  "not-applicable",
  "blocked",
]);

const validationValueSchema = z.union([
  validationStateSchema,
  z
    .object({
      state: validationStateSchema,
      detail: publicText(500).optional(),
    })
    .strict(),
]);

const validationFields = {
  implementation: validationValueSchema,
  compile: validationValueSchema,
  automatedTest: validationValueSchema,
  manualValidation: validationValueSchema,
};

export const partialValidationSchema = z
  .object({
    implementation: validationFields.implementation.optional(),
    compile: validationFields.compile.optional(),
    automatedTest: validationFields.automatedTest.optional(),
    manualValidation: validationFields.manualValidation.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "must include at least one validation field",
  });

const completeValidationSchema = z
  .object(validationFields)
  .strict();

const milestoneOperationSchema = z
  .object({
    type: z.literal("milestone"),
    systemId: identifier,
    milestoneId: identifier,
    state: milestoneStateSchema.optional(),
    publicNote: publicText(800).nullable().optional(),
    updatedAt: publicText(100).nullable().optional(),
    validation: partialValidationSchema.nullable().optional(),
  })
  .strict();

const currentFocusOperationSchema = z
  .object({
    type: z.literal("current-focus"),
    title: publicText(160),
    status: publicStatusSchema,
    explanation: publicText(1_200),
    nextAction: publicText(600),
    validation: completeValidationSchema,
    updatedAt: publicText(100).nullable().optional(),
  })
  .strict();

const activityOperationSchema = z
  .object({
    type: z.literal("activity"),
    id: identifier,
    title: publicText(180),
    description: publicText(1_200),
    category: publicText(100),
    status: publicStatusSchema,
    validation: validationStateSchema,
    validationDetail: publicText(500).optional(),
    date: publicText(100).optional(),
    orderLabel: publicText(120),
    relatedDevlogSlug: identifier.optional(),
  })
  .strict();

const developmentLogSectionSchema = z
  .object({
    heading: publicText(160),
    paragraphs: z.array(publicText(2_000)).min(1).max(20),
  })
  .strict();

const developmentLogBase = {
  type: z.literal("devlog"),
  slug: identifier,
};

const developmentLogAddSchema = z
  .object({
    ...developmentLogBase,
    mode: z.literal("add"),
    title: publicText(180),
    summary: publicText(1_200),
    category: publicText(100),
    status: publicStatusSchema,
    validationState: validationStateSchema,
    validation: partialValidationSchema.optional(),
    relatedSystemIds: z.array(identifier).min(1).max(20),
    date: publicText(100).optional(),
    sections: z.array(developmentLogSectionSchema).min(1).max(20),
  })
  .strict();

const developmentLogUpdateSchema = z
  .object({
    ...developmentLogBase,
    mode: z.literal("update"),
    title: publicText(180).optional(),
    summary: publicText(1_200).optional(),
    category: publicText(100).optional(),
    status: publicStatusSchema.optional(),
    validationState: validationStateSchema.optional(),
    validation: partialValidationSchema.nullable().optional(),
    relatedSystemIds: z.array(identifier).min(1).max(20).optional(),
    date: publicText(100).nullable().optional(),
    sections: z.array(developmentLogSectionSchema).min(1).max(20).optional(),
  })
  .strict();

export const statusUpdatePayloadSchema = z
  .object({
    schemaVersion: z.literal(1),
    updateId: identifier,
    summary: publicText(500),
    changes: z
      .array(
        z.union([
          milestoneOperationSchema,
          currentFocusOperationSchema,
          activityOperationSchema,
          developmentLogAddSchema,
          developmentLogUpdateSchema,
        ]),
      )
      .min(1)
      .max(50),
  })
  .strict()
  .superRefine((payload, context) => {
    const targets = new Set<string>();
    let focusCount = 0;

    payload.changes.forEach((change, index) => {
      let target: string;

      if (change.type === "milestone") {
        target = `milestone:${change.systemId}/${change.milestoneId}`;
        const hasUpdate =
          change.state !== undefined ||
          change.publicNote !== undefined ||
          change.updatedAt !== undefined ||
          change.validation !== undefined;

        if (!hasUpdate) {
          context.addIssue({
            code: "custom",
            message: "milestone change must include at least one mutable field",
            path: ["changes", index],
          });
        }
      } else if (change.type === "current-focus") {
        target = "current-focus";
        focusCount += 1;
      } else if (change.type === "activity") {
        target = `activity:${change.id}`;
      } else {
        target = `devlog:${change.slug}`;

        if (
          change.mode === "update" &&
          Object.keys(change).every((key) =>
            ["type", "mode", "slug"].includes(key),
          )
        ) {
          context.addIssue({
            code: "custom",
            message: "devlog update must include at least one mutable field",
            path: ["changes", index],
          });
        }
      }

      if (targets.has(target)) {
        context.addIssue({
          code: "custom",
          message: `duplicate or conflicting target: ${target}`,
          path: ["changes", index],
        });
      }
      targets.add(target);
    });

    if (focusCount > 1) {
      context.addIssue({
        code: "custom",
        message: "only one current-focus change is allowed per update",
        path: ["changes"],
      });
    }
  });

export type StatusUpdatePayload = z.infer<typeof statusUpdatePayloadSchema>;
export type StatusUpdateOperation = StatusUpdatePayload["changes"][number];
export type ValidationInput = z.infer<typeof partialValidationSchema>;

const publicationHistoryEntrySchema = z
  .object({
    updateId: identifier,
    summary: publicText(500),
    appliedAt: z.string().datetime({ offset: true }),
    changedSystems: z.array(identifier),
    changedMilestones: z.array(z.string().min(3).max(220)),
  })
  .strict();

export const publicationHistorySchema = z
  .object({
    schemaVersion: z.literal(1),
    entries: z.array(publicationHistoryEntrySchema),
  })
  .strict()
  .superRefine((history, context) => {
    const updateIds = new Set<string>();
    history.entries.forEach((entry, index) => {
      if (updateIds.has(entry.updateId)) {
        context.addIssue({
          code: "custom",
          message: `duplicate history update ID: ${entry.updateId}`,
          path: ["entries", index, "updateId"],
        });
      }
      updateIds.add(entry.updateId);
    });
  });

export type PublicationHistory = z.infer<typeof publicationHistorySchema>;

export function formatSchemaError(error: z.ZodError) {
  return z.prettifyError(error);
}
