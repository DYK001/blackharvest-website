import { readFile } from "node:fs/promises";
import path from "node:path";

import { PublisherError } from "./core.mts";
import {
  checkPublisherState,
  publishStatusUpdate,
  readJsonFile,
  resolveUpdatePath,
  restoreBackup,
} from "./publisher.mts";

function usage() {
  return [
    "BlackHarvest local status publisher",
    "",
    "Commands:",
    "  npm run status:check",
    "  npm run status:publish -- <update-file.json> [--dry-run]",
    "  npm run status:restore -- <backup-id>",
  ].join("\n");
}

async function assertRepositoryRoot(repositoryRoot: string) {
  const packageSource = await readFile(
    path.join(repositoryRoot, "package.json"),
    "utf8",
  );
  const packageData = JSON.parse(packageSource) as { name?: string };
  if (packageData.name !== "blackharvest-site") {
    throw new PublisherError(
      "Run the publisher from the BlackHarvest website repository root",
    );
  }
}

function printPlan(
  result: Awaited<ReturnType<typeof publishStatusUpdate>>,
) {
  const { plan } = result;
  console.log(result.written ? "STATUS UPDATE APPLIED" : "DRY RUN — NO FILES WRITTEN");
  console.log(`Update ID: ${plan.payload.updateId}`);
  console.log(`Summary: ${plan.payload.summary}`);
  console.log("Changes:");
  for (const line of plan.summaryLines) console.log(`  - ${line}`);
  console.log(`Data groups: ${plan.changedKeys.join(", ")}`);

  if (result.backupId) console.log(`Backup ID: ${result.backupId}`);
  for (const warning of result.retentionWarnings) {
    console.warn(`Backup warning: ${warning}`);
  }
}

async function main() {
  const repositoryRoot = process.cwd();
  await assertRepositoryRoot(repositoryRoot);

  const [command, ...argumentsAfterCommand] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help") {
    console.log(usage());
    return;
  }

  if (command === "check") {
    if (argumentsAfterCommand.length > 0) {
      throw new PublisherError("status:check does not accept arguments");
    }
    const counts = await checkPublisherState(repositoryRoot);
    console.log("STATUS DATA CHECK PASSED");
    console.log(
      `${counts.systems} systems, ${counts.milestones} milestones, ${counts.activities} activities, ${counts.devlogs} devlogs, ${counts.historyEntries} publication history entries.`,
    );
    return;
  }

  if (command === "publish") {
    const dryRun = argumentsAfterCommand.includes("--dry-run");
    const positional = argumentsAfterCommand.filter(
      (argument) => argument !== "--dry-run",
    );
    const unknownFlags = positional.filter((argument) => argument.startsWith("-"));
    if (unknownFlags.length > 0) {
      throw new PublisherError(`Unknown option: ${unknownFlags[0]}`);
    }
    if (positional.length !== 1) {
      throw new PublisherError(
        "status:publish requires exactly one JSON update file",
      );
    }

    const updatePath = resolveUpdatePath(repositoryRoot, positional[0]);
    const rawPayload = await readJsonFile(updatePath);
    const result = await publishStatusUpdate({
      repositoryRoot,
      rawPayload,
      dryRun,
    });
    printPlan(result);
    return;
  }

  if (command === "restore") {
    if (argumentsAfterCommand.length !== 1) {
      throw new PublisherError("status:restore requires exactly one backup ID");
    }
    const result = await restoreBackup(
      repositoryRoot,
      argumentsAfterCommand[0],
    );
    console.log("STATUS BACKUP RESTORED");
    console.log(`Backup ID: ${argumentsAfterCommand[0]}`);
    console.log(`Restored data groups: ${result.restoredKeys.join(", ")}`);
    for (const warning of result.warnings) {
      console.warn(`Restore warning: ${warning}`);
    }
    return;
  }

  throw new PublisherError(`Unknown command: ${command}\n\n${usage()}`);
}

main().catch((error: unknown) => {
  if (error instanceof PublisherError) {
    console.error(`ERROR: ${error.message}`);
  } else {
    console.error(
      `ERROR: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  process.exitCode = 1;
});
