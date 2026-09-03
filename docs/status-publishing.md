# Local development-status publishing

The status publisher is a local-only trust boundary around the structured public data in `src/data`. It accepts inert JSON, validates the entire proposed result, previews derived milestone progress, and writes only the known data modules plus internal publication history.

It does not connect to Unreal Engine, Git remotes, hosting providers, accounts, databases, or deployment services. It cannot run JavaScript from an update file and it does not accept output paths.

## Commands

Run commands from the repository root:

```bash
npm run status:check
npm run status:publish -- path/to/update.json --dry-run
npm run status:publish -- path/to/update.json
npm run status:restore -- BACKUP_ID
npm run test:status
```

Always run `status:check` before preparing an update and use `--dry-run` before a real publication. The dry run performs the same schema, ID, relationship, and integrity checks as a real publication, prints a human-readable summary, and writes nothing.

## Update file schema

Every update is strict JSON with this top-level shape:

```json
{
  "schemaVersion": 1,
  "updateId": "unique-lowercase-kebab-case-id",
  "summary": "Short internal description of the verified update.",
  "changes": []
}
```

Unknown fields are rejected. IDs and slugs use lowercase kebab-case. Public copy is plain text: HTML, scripts, control characters, and machine paths are rejected. The `updateId` is recorded after a successful write and can never be applied twice.

The four validation keys used by update files are:

- `implementation`
- `compile`
- `automatedTest`
- `manualValidation`

A validation value may be a state string or an object with an explicit state and public detail:

```json
{
  "manualValidation": {
    "state": "blocked",
    "detail": "Verified public explanation."
  }
}
```

Allowed validation states are `passed`, `pending`, `failed`, `not-applicable`, and `blocked`.

### Milestone update

```json
{
  "type": "milestone",
  "systemId": "zombie-hit-death",
  "milestoneId": "final-ragdoll-validation",
  "state": "blocked",
  "publicNote": "Verified public note.",
  "updatedAt": "Verified date or label supplied by the developer.",
  "validation": {
    "manualValidation": "blocked"
  }
}
```

At least one mutable field is required. `publicNote`, `updatedAt`, or `validation` may be `null` to remove that field. The publisher refuses unknown system and milestone IDs. Milestone percentages remain derived at render time from exact `complete` states; update files cannot submit a percentage.

### Current-focus update

```json
{
  "type": "current-focus",
  "title": "Verified focus title",
  "status": "in-development",
  "explanation": "Verified public explanation.",
  "nextAction": "Verified next action.",
  "validation": {
    "implementation": "passed",
    "compile": "passed",
    "automatedTest": "not-applicable",
    "manualValidation": "pending"
  },
  "updatedAt": "Optional verified date or label"
}
```

All four validation stages are required when replacing the current focus so no validation value is inherited accidentally from the prior task. Omit `updatedAt` when no verified date is supplied; the publisher never invents one.

### Activity addition

```json
{
  "type": "activity",
  "id": "unique-activity-id",
  "title": "Verified activity title",
  "description": "Verified activity description.",
  "category": "Systems",
  "status": "implemented",
  "validation": "pending",
  "validationDetail": "Optional verified detail.",
  "orderLabel": "Verified ordering label",
  "date": "Optional verified date",
  "relatedDevlogSlug": "optional-existing-or-new-devlog-slug"
}
```

Activity entries are additions only. Duplicate IDs are rejected. A related devlog must already exist or be added in the same transaction.

### Development-log addition or update

Use `mode: "add"` with all public fields:

```json
{
  "type": "devlog",
  "mode": "add",
  "slug": "unique-devlog-slug",
  "title": "Verified title",
  "summary": "Verified summary.",
  "category": "Systems",
  "status": "in-development",
  "validationState": "pending",
  "validation": {
    "implementation": "passed",
    "manualValidation": "pending"
  },
  "relatedSystemIds": ["player-combat"],
  "date": "Optional verified date",
  "sections": [
    {
      "heading": "Verified heading",
      "paragraphs": ["Verified public paragraph."]
    }
  ]
}
```

Use `mode: "update"` with an existing slug and at least one field to change. For updates, `date` and `validation` may be `null` to remove them. Every related system ID must exist.

See `examples/status-updates` for complete dry-run examples. Examples are structural templates and must not be applied unchanged.

## Validation and consistency rules

Before any write, the publisher validates both current data and the complete proposed data set. It rejects:

- malformed JSON, the wrong schema version, missing required fields, and unknown fields;
- unsafe or oversized public strings;
- duplicate or conflicting targets in one payload;
- operations that produce no data change;
- duplicate update IDs, activity IDs, system IDs, milestone IDs, or devlog slugs;
- unknown system IDs, milestone IDs, devlog links, or related-system links;
- milestone-based systems without milestones;
- `complete` systems containing unfinished milestones;
- `complete` milestones with pending, failed, or blocked validation;
- `complete` or `validated` tasks, activities, and devlogs with incomplete validation.

Unknown facts stay omitted, status-only, planned, pending, or blocked. The publisher never derives dates, invents validation outcomes, changes a parent system status automatically, or creates a project-wide percentage.

## Transaction, history, and recovery

For a real publication, the publisher:

1. parses the selected data exports as inert literals;
2. builds and validates the full proposed in-memory data set;
3. creates a pre-write snapshot under `.status-backups` for only the affected data groups;
4. stages every output file and the history update;
5. promotes all staged files as one rollback-capable transaction;
6. records the update in `data/status-publication-history.json` with its automatic application timestamp and affected systems/milestones;
7. retains the newest 10 successful publication backups.

If validation fails, nothing is written and no backup is created. If file promotion fails, the publisher restores the original files and removes the failed backup. Backup directories are local and Git-ignored.

To restore public data from a successful publication:

```bash
npm run status:restore -- BACKUP_ID
```

Restore validates the backup against the current full data set before using the same rollback-capable file transaction. It restores only the data groups captured by that backup. Publication history is intentionally retained, so the restored update ID remains protected from accidental reuse.

After publishing or restoring, run:

```bash
npm run status:check
npm run test:status
npm run lint
npm run typecheck
npm run build
```
