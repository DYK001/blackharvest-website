import { randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import {
  clonePublicDevelopmentData,
  dataFiles,
  readDataValueFromSource,
  readPublicDevelopmentData,
  renderDataFile,
  type DataFileKey,
} from "./data-store.mts";
import {
  assertDataIsPublishable,
  createPublicationPlan,
  PublisherError,
  type PublicationPlan,
} from "./core.mts";
import {
  formatSchemaError,
  publicationHistorySchema,
  type PublicationHistory,
} from "./schema.mts";

const historyRelativePath = "data/status-publication-history.json";
const backupRelativePath = ".status-backups";
const backupRetentionLimit = 10;

const dataFileKeySchema = z.enum([
  "projectStatus",
  "developmentSystems",
  "activityEntries",
  "developmentLogEntries",
]);

const backupManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    backupId: z.string().min(1).max(180),
    updateId: z.string().min(1).max(100),
    createdAt: z.string().datetime({ offset: true }),
    changedKeys: z.array(dataFileKeySchema).min(1),
  })
  .strict();

type BackupManifest = z.infer<typeof backupManifestSchema>;

interface TransactionStage {
  target: string;
  temporary: string;
  previous: string;
  movedOriginal: boolean;
  promoted: boolean;
}

export interface PublishResult {
  plan: PublicationPlan;
  written: boolean;
  backupId?: string;
  retentionWarnings: string[];
}

function isPathInside(repositoryRoot: string, candidate: string) {
  const relative = path.relative(repositoryRoot, candidate);
  return (
    relative !== "" &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}

function assertRepositoryPath(repositoryRoot: string, candidate: string) {
  if (!isPathInside(repositoryRoot, candidate)) {
    throw new PublisherError("Publisher path must stay inside this repository");
  }
}

export function resolveUpdatePath(
  repositoryRoot: string,
  suppliedPath: string,
) {
  const candidate = path.resolve(repositoryRoot, suppliedPath);
  assertRepositoryPath(repositoryRoot, candidate);
  if (path.extname(candidate).toLowerCase() !== ".json") {
    throw new PublisherError("Update payload must be a .json file");
  }
  return candidate;
}

export async function readJsonFile(filePath: string): Promise<unknown> {
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    throw new PublisherError(
      `Could not read JSON file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    throw new PublisherError(
      `Invalid JSON syntax: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function readPublicationHistory(
  repositoryRoot: string,
): Promise<PublicationHistory> {
  const historyPath = path.join(repositoryRoot, historyRelativePath);
  assertRepositoryPath(repositoryRoot, historyPath);
  const rawHistory = await readJsonFile(historyPath);
  const parsed = publicationHistorySchema.safeParse(rawHistory);
  if (!parsed.success) {
    throw new PublisherError(
      `Publication history is invalid:\n${formatSchemaError(parsed.error)}`,
    );
  }
  return parsed.data;
}

function renderHistory(history: PublicationHistory) {
  return `${JSON.stringify(history, null, 2)}\n`;
}

export async function atomicWriteFiles(
  repositoryRoot: string,
  files: ReadonlyMap<string, string>,
) {
  const transactionId = randomUUID();
  const stages: TransactionStage[] = [];

  try {
    for (const [target, content] of files) {
      assertRepositoryPath(repositoryRoot, target);
      const directory = path.dirname(target);
      const baseName = path.basename(target);
      const temporary = path.join(
        directory,
        `.${baseName}.status-tmp-${transactionId}`,
      );
      const previous = path.join(
        directory,
        `.${baseName}.status-prev-${transactionId}`,
      );
      assertRepositoryPath(repositoryRoot, temporary);
      assertRepositoryPath(repositoryRoot, previous);
      stages.push({
        target,
        temporary,
        previous,
        movedOriginal: false,
        promoted: false,
      });
      await writeFile(temporary, content, "utf8");
    }
  } catch (error) {
    await Promise.allSettled(
      stages.map((stage) => rm(stage.temporary, { force: true })),
    );
    throw new PublisherError(
      `No status update was committed because file staging failed. ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  try {
    for (const stage of stages) {
      await rename(stage.target, stage.previous);
      stage.movedOriginal = true;
      await rename(stage.temporary, stage.target);
      stage.promoted = true;
    }
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const stage of [...stages].reverse()) {
      try {
        if (stage.promoted) await rm(stage.target, { force: true });
        if (stage.movedOriginal) await rename(stage.previous, stage.target);
      } catch (rollbackError) {
        rollbackErrors.push(
          rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError),
        );
      }
    }
    await Promise.allSettled(
      stages.flatMap((stage) => [
        rm(stage.temporary, { force: true }),
        rm(stage.previous, { force: true }),
      ]),
    );

    const rollbackSuffix =
      rollbackErrors.length > 0
        ? ` Rollback also reported: ${rollbackErrors.join("; ")}`
        : "";
    throw new PublisherError(
      `No status update was committed because the file transaction failed.${rollbackSuffix} ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const cleanup = await Promise.allSettled(
    stages.map((stage) => rm(stage.previous, { force: true })),
  );
  const cleanupFailures = cleanup.filter((result) => result.status === "rejected");
  return cleanupFailures.length > 0
    ? [
        "Status update committed, but transaction cleanup reported leftover status-prev files",
      ]
    : [];
}

function makeBackupId(appliedAt: string, updateId: string) {
  const safeTimestamp = appliedAt.replace(/[:]/g, "-");
  return `${safeTimestamp}-${updateId}`;
}

async function createBackup(
  repositoryRoot: string,
  plan: PublicationPlan,
): Promise<{ backupId: string; backupDirectory: string }> {
  const backupId = makeBackupId(
    plan.historyEntry.appliedAt,
    plan.payload.updateId,
  );
  const backupDirectory = path.join(
    repositoryRoot,
    backupRelativePath,
    backupId,
  );
  assertRepositoryPath(repositoryRoot, backupDirectory);

  const manifest: BackupManifest = {
    schemaVersion: 1,
    backupId,
    updateId: plan.payload.updateId,
    createdAt: plan.historyEntry.appliedAt,
    changedKeys: plan.changedKeys,
  };

  await mkdir(path.join(repositoryRoot, backupRelativePath), {
    recursive: true,
  });
  await mkdir(backupDirectory, { recursive: false });

  try {
    for (const key of plan.changedKeys) {
      const definition = dataFiles[key];
      const sourcePath = path.join(repositoryRoot, definition.relativePath);
      const source = await readFile(sourcePath, "utf8");
      const diskValue = readDataValueFromSource(
        key,
        source,
        definition.relativePath,
      );
      if (
        JSON.stringify(diskValue) !== JSON.stringify(plan.previousData[key])
      ) {
        throw new PublisherError(
          `Status data changed while preparing the transaction: ${key}`,
        );
      }

      const backupPath = path.join(backupDirectory, definition.relativePath);
      assertRepositoryPath(repositoryRoot, backupPath);
      await mkdir(path.dirname(backupPath), { recursive: true });
      await writeFile(backupPath, source, "utf8");
    }

    await writeFile(
      path.join(backupDirectory, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
  } catch (error) {
    await rm(backupDirectory, { recursive: true, force: true });
    if (error instanceof PublisherError) throw error;
    throw new PublisherError(
      `Could not create the pre-write backup; nothing was written. ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return { backupId, backupDirectory };
}

async function retainRecentBackups(repositoryRoot: string) {
  const backupRoot = path.join(repositoryRoot, backupRelativePath);
  assertRepositoryPath(repositoryRoot, backupRoot);
  const entries = await readdir(backupRoot, { withFileTypes: true });
  const manifests: Array<{ directory: string; createdAt: string }> = [];
  const warnings: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(backupRoot, entry.name);
    try {
      const raw = await readJsonFile(path.join(directory, "manifest.json"));
      const parsed = backupManifestSchema.safeParse(raw);
      if (!parsed.success) {
        warnings.push(`Skipped invalid backup metadata: ${entry.name}`);
        continue;
      }
      manifests.push({ directory, createdAt: parsed.data.createdAt });
    } catch {
      warnings.push(`Skipped unreadable backup metadata: ${entry.name}`);
    }
  }

  manifests.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  for (const oldBackup of manifests.slice(backupRetentionLimit)) {
    assertRepositoryPath(repositoryRoot, oldBackup.directory);
    await rm(oldBackup.directory, { recursive: true, force: true });
  }

  return warnings;
}

export async function publishStatusUpdate(options: {
  repositoryRoot: string;
  rawPayload: unknown;
  dryRun: boolean;
  appliedAt?: string;
}): Promise<PublishResult> {
  const { repositoryRoot, rawPayload, dryRun, appliedAt } = options;
  const [currentData, history] = await Promise.all([
    readPublicDevelopmentData(repositoryRoot),
    readPublicationHistory(repositoryRoot),
  ]);
  const plan = createPublicationPlan(
    rawPayload,
    currentData,
    history,
    appliedAt,
  );

  if (dryRun) {
    return { plan, written: false, retentionWarnings: [] };
  }

  const { backupId, backupDirectory } = await createBackup(
    repositoryRoot,
    plan,
  );
  const nextHistory: PublicationHistory = {
    schemaVersion: 1,
    entries: [...history.entries, plan.historyEntry],
  };
  const files = new Map<string, string>();

  for (const key of plan.changedKeys) {
    files.set(
      path.join(repositoryRoot, dataFiles[key].relativePath),
      renderDataFile(key, plan.nextData),
    );
  }
  files.set(
    path.join(repositoryRoot, historyRelativePath),
    renderHistory(nextHistory),
  );

  let transactionWarnings: string[];
  try {
    transactionWarnings = await atomicWriteFiles(repositoryRoot, files);
  } catch (error) {
    await rm(backupDirectory, { recursive: true, force: true });
    throw error;
  }

  let retentionWarnings: string[];
  try {
    retentionWarnings = await retainRecentBackups(repositoryRoot);
  } catch (error) {
    retentionWarnings = [
      `Status was applied, but backup retention cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }
  retentionWarnings.unshift(...transactionWarnings);
  return { plan, written: true, backupId, retentionWarnings };
}

export async function checkPublisherState(repositoryRoot: string) {
  const [data, history] = await Promise.all([
    readPublicDevelopmentData(repositoryRoot),
    readPublicationHistory(repositoryRoot),
  ]);
  assertDataIsPublishable(data);
  return {
    systems: data.developmentSystems.length,
    milestones: data.developmentSystems.reduce(
      (total, system) => total + (system.milestones?.length ?? 0),
      0,
    ),
    activities: data.activityEntries.length,
    devlogs: data.developmentLogEntries.length,
    historyEntries: history.entries.length,
  };
}

export async function restoreBackup(
  repositoryRoot: string,
  backupId: string,
) {
  if (
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$/.test(backupId) ||
    backupId.includes("..")
  ) {
    throw new PublisherError("Invalid backup ID");
  }

  const manifestPath = path.join(
    repositoryRoot,
    backupRelativePath,
    backupId,
    "manifest.json",
  );
  assertRepositoryPath(repositoryRoot, manifestPath);
  const rawManifest = await readJsonFile(manifestPath);
  const parsed = backupManifestSchema.safeParse(rawManifest);
  if (!parsed.success) {
    throw new PublisherError(
      `Backup metadata is invalid:\n${formatSchemaError(parsed.error)}`,
    );
  }
  if (parsed.data.backupId !== backupId) {
    throw new PublisherError("Backup ID does not match its manifest");
  }

  const currentData = await readPublicDevelopmentData(repositoryRoot);
  const nextData = clonePublicDevelopmentData(currentData);
  const restoredSources = new Map<DataFileKey, string>();
  for (const key of parsed.data.changedKeys) {
    const definition = dataFiles[key];
    const backupPath = path.join(
      repositoryRoot,
      backupRelativePath,
      backupId,
      definition.relativePath,
    );
    assertRepositoryPath(repositoryRoot, backupPath);
    let source: string;
    try {
      source = await readFile(backupPath, "utf8");
    } catch {
      throw new PublisherError(`Backup is missing data for ${key}`);
    }
    nextData[key] = readDataValueFromSource(
      key,
      source,
      definition.relativePath,
    ) as never;
    restoredSources.set(key, source);
  }
  assertDataIsPublishable(nextData);

  const files = new Map<string, string>();
  for (const key of parsed.data.changedKeys) {
    files.set(
      path.join(repositoryRoot, dataFiles[key].relativePath),
      restoredSources.get(key) as string,
    );
  }
  const warnings = await atomicWriteFiles(repositoryRoot, files);
  return { restoredKeys: parsed.data.changedKeys, warnings };
}
