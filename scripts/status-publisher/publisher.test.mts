import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { readPublicDevelopmentData } from "./data-store.mts";
import {
  createPublicationPlan,
  parseStatusUpdate,
  PublisherError,
} from "./core.mts";
import {
  atomicWriteFiles,
  publishStatusUpdate,
  resolveUpdatePath,
} from "./publisher.mts";
import type { PublicationHistory } from "./schema.mts";

const repositoryRoot = process.cwd();

function emptyHistory(): PublicationHistory {
  return { schemaVersion: 1, entries: [] };
}

function milestonePayload(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    updateId: "test-zombie-ragdoll-note",
    summary: "Verify the existing blocked ragdoll milestone representation.",
    changes: [
      {
        type: "milestone",
        systemId: "zombie-hit-death",
        milestoneId: "final-ragdoll-validation",
        publicNote:
          "Test preview only: replace this with verified public information.",
      },
    ],
    ...overrides,
  };
}

test("accepts a valid update payload", () => {
  const parsed = parseStatusUpdate(milestonePayload());
  assert.equal(parsed.updateId, "test-zombie-ragdoll-note");
});

test("rejects an invalid or over-posting schema", () => {
  assert.throws(
    () =>
      parseStatusUpdate({
        ...milestonePayload(),
        remoteUrl: "https://example.invalid",
      }),
    PublisherError,
  );
});

test("rejects unknown systems without mutating input data", async () => {
  const data = await readPublicDevelopmentData(repositoryRoot);
  const before = structuredClone(data);
  const payload = milestonePayload({
    changes: [
      {
        type: "milestone",
        systemId: "unknown-system",
        milestoneId: "unknown-milestone",
        state: "implemented",
      },
    ],
  });

  assert.throws(
    () => createPublicationPlan(payload, data, emptyHistory()),
    /Unknown system ID/,
  );
  assert.deepEqual(data, before);
});

test("rejects unknown milestones without mutating input data", async () => {
  const data = await readPublicDevelopmentData(repositoryRoot);
  const before = structuredClone(data);
  const payload = milestonePayload({
    changes: [
      {
        type: "milestone",
        systemId: "zombie-hit-death",
        milestoneId: "unknown-milestone",
        state: "implemented",
      },
    ],
  });

  assert.throws(
    () => createPublicationPlan(payload, data, emptyHistory()),
    /Unknown milestone ID/,
  );
  assert.deepEqual(data, before);
});

test("rejects duplicate update IDs", async () => {
  const data = await readPublicDevelopmentData(repositoryRoot);
  const payload = milestonePayload();
  const history: PublicationHistory = {
    schemaVersion: 1,
    entries: [
      {
        updateId: "test-zombie-ragdoll-note",
        summary: "Already applied fixture.",
        appliedAt: "2026-09-03T00:00:00.000Z",
        changedSystems: ["zombie-hit-death"],
        changedMilestones: [
          "zombie-hit-death/final-ragdoll-validation",
        ],
      },
    ],
  };

  assert.throws(
    () => createPublicationPlan(payload, data, history),
    /already been applied/,
  );
});

test("dry run writes no status or history file", async () => {
  const dataPath = path.join(
    repositoryRoot,
    "src/data/development-systems.ts",
  );
  const historyPath = path.join(
    repositoryRoot,
    "data/status-publication-history.json",
  );
  const beforeData = await readFile(dataPath, "utf8");
  const beforeHistory = await readFile(historyPath, "utf8");

  const result = await publishStatusUpdate({
    repositoryRoot,
    rawPayload: milestonePayload(),
    dryRun: true,
    appliedAt: "2026-09-03T00:00:00.000Z",
  });

  assert.equal(result.written, false);
  assert.equal(await readFile(dataPath, "utf8"), beforeData);
  assert.equal(await readFile(historyPath, "utf8"), beforeHistory);
});

test("derives milestone progress from exact complete states", async () => {
  const data = await readPublicDevelopmentData(repositoryRoot);
  const payload = milestonePayload({
    updateId: "test-derived-progress",
    changes: [
      {
        type: "milestone",
        systemId: "player-combat",
        milestoneId: "pose-polish",
        state: "complete",
      },
    ],
  });
  const plan = createPublicationPlan(payload, data, emptyHistory());

  assert.match(plan.summaryLines[0], /8\/10 complete \(80%\)/);
  assert.match(plan.summaryLines[0], /9\/10 complete \(90%\)/);
});

test("rejects contradictory completion and blocked validation", async () => {
  const data = await readPublicDevelopmentData(repositoryRoot);
  const before = structuredClone(data);
  const payload = milestonePayload({
    updateId: "test-invalid-completion",
    changes: [
      {
        type: "milestone",
        systemId: "zombie-hit-death",
        milestoneId: "final-ragdoll-validation",
        state: "complete",
      },
    ],
  });

  assert.throws(
    () => createPublicationPlan(payload, data, emptyHistory()),
    /Complete milestone has incomplete validation/,
  );
  assert.deepEqual(data, before);
});

test("rejects duplicate operation targets", () => {
  const change = milestonePayload().changes[0];
  assert.throws(
    () =>
      parseStatusUpdate(
        milestonePayload({
          changes: [change, change],
        }),
      ),
    /duplicate or conflicting target/,
  );
});

test("rejects development logs that reference unknown systems", async () => {
  const data = await readPublicDevelopmentData(repositoryRoot);
  const payload = milestonePayload({
    updateId: "test-unknown-related-system",
    changes: [
      {
        type: "devlog",
        mode: "add",
        slug: "test-log-entry",
        title: "Test log entry",
        summary: "A local validation fixture.",
        category: "Testing",
        status: "planned",
        validationState: "pending",
        relatedSystemIds: ["unknown-system"],
        sections: [
          {
            heading: "Fixture",
            paragraphs: ["This entry is used only by the local test suite."],
          },
        ],
      },
    ],
  });

  assert.throws(
    () => createPublicationPlan(payload, data, emptyHistory()),
    /references unknown system/,
  );
});

test("rejects update paths outside the repository", () => {
  assert.throws(
    () => resolveUpdatePath(repositoryRoot, "../outside.json"),
    /inside this repository/,
  );
});

test("rolls back an interrupted multi-file transaction", async () => {
  const temporaryRoot = path.join(
    repositoryRoot,
    "scripts/status-publisher",
    `.test-transaction-${randomUUID()}`,
  );
  const firstTarget = path.join(temporaryRoot, "first.txt");
  const missingTarget = path.join(temporaryRoot, "missing.txt");

  await mkdir(temporaryRoot);
  await writeFile(firstTarget, "original", "utf8");

  try {
    await assert.rejects(
      atomicWriteFiles(
        repositoryRoot,
        new Map([
          [firstTarget, "changed"],
          [missingTarget, "never committed"],
        ]),
      ),
      /file transaction failed/,
    );
    assert.equal(await readFile(firstTarget, "utf8"), "original");
    const remaining = await readdir(temporaryRoot);
    assert.deepEqual(remaining, ["first.txt"]);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
