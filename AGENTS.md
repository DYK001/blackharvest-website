<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BlackHarvest website repository rules

1. Never work outside this repository.
2. Never access or modify the Unreal Engine BlackHarvest project.
3. Never fabricate project progress.
4. All public project status must come from the website's structured data files.
5. Do not mark a feature Complete unless its data explicitly says it is complete.
6. Keep presentation and project-status data separated.
7. Run lint, type checking, and a production build before reporting completion.
8. Avoid unnecessary dependencies.
9. Preserve the dark, grounded medieval BlackHarvest visual identity.
10. Never expose machine paths, private developer information, secrets, API keys, or internal-only information in the public UI.
11. Use `npm run status:publish -- <update-file>` for routine public development-status changes; do not bypass its validation with direct data edits.
12. Every update payload must contain verified facts, a unique `updateId`, and only the fields needed for that update.
13. Run `npm run status:check` and a `--dry-run` before any real status publication.
14. Never supply or infer a project-wide percentage. Milestone progress is derived only from exact `complete` milestone states.
15. Never invent dates or validation outcomes. Omit unknown dates and keep unknown validation pending or absent.
16. Files in `examples/status-updates` are structural templates and must never be applied unchanged.
17. Keep `.status-backups` local and Git-ignored. Do not publish its contents or internal status history to the public UI.
18. The status publisher must remain local-only: no Unreal access, remote Git actions, deployment, hosting, account, database, or cloud integration.
19. English is the canonical default locale at `/`; Korean is a presentation overlay at `/ko` and must use the same structured status facts, IDs, states, and development-log slugs.
20. Keep Korean copy in `src/i18n` and use explicit English fallback in shared renderers. Never duplicate project-status truth into locale files.
21. Run `npm run i18n:check` whenever published systems, milestones, activities, development logs, or media assets change.
