# BlackHarvest development website

The official local website and public development dashboard for BlackHarvest, a grounded medieval open-world survival project.

## Local setup

Install the locked dependency set with npm:

```bash
npm ci
```

Start the local development server:

```bash
npm run dev
```

The site is available at `http://localhost:3000`.

## Project status updates

Public development facts are stored in `src/data` and typed by `src/types/project.ts`. Update these records rather than embedding project status inside presentation components.

- `project-status.ts` — overall status, current focus, blocker, next action, and validation stages
- `development-systems.ts` — verified system milestones, validation results, and progress mode
- `roadmap.ts` — roadmap areas linked to the same development-system records
- `activity.ts` — recent development activity
- `development-log.ts` — data for previews and `/devlog/[slug]` pages
- `game-systems.ts` — stable public project overview copy

Milestone percentages are calculated by `src/lib/progress.ts`; only milestones with the exact state `complete` count toward completion. Status-only systems never render a percentage. `src/lib/validate-development-data.ts` rejects duplicate IDs and inconsistent completion claims during development and production builds.

Unknown values stay absent, status-only, or pending. Do not add percentages, dates, milestones, or validation results until they are verified.

Routine development-status changes must go through the local validated publisher:

```bash
npm run status:check
npm run status:publish -- examples/status-updates/01-milestone-update.json --dry-run
```

The publisher accepts strict JSON, rejects unknown IDs and contradictory completion claims, writes all affected files transactionally, records applied update IDs in internal history, and keeps the latest 10 local backups. It has no remote, deployment, account, database, or Unreal Engine integration. See [Local development-status publishing](docs/status-publishing.md) for the schema, operation types, recovery procedure, and safe examples.

## Validation and production build

```bash
npm run test:status
npm run status:check
npm run test:media
npm run media:check
npm run lint
npm run typecheck
npm run build
```

`npm run build` is the production build command and runs the media integrity check before `next build`. To smoke-test that build locally, run `npm run start` and visit `http://localhost:3000`.

## Environment variables

No environment variables are required to build or run the site. On Vercel, the deployment URL supplied by the platform is used for absolute social-image metadata. `NEXT_PUBLIC_SITE_URL` is an optional override for a final custom production domain and must be a complete `https://` URL when used.

## GitHub

Create a GitHub repository, then upload or push this repository without generated and local-only files excluded by `.gitignore`.

Repository visibility is the user's decision:

- A public repository exposes committed source code and first-party media.
- A private repository keeps them private; Vercel access then depends on the user's Git provider and account permissions.

No GitHub repository URL is configured by this project.

## Vercel deployment

1. Sign in to Vercel.
2. Choose **Add New → Project**.
3. Import the GitHub repository.
4. Allow Vercel to detect Next.js automatically.
5. Set the install command to `npm ci` for a deterministic install and confirm the build command is `npm run build`.
6. Leave environment variables empty unless setting the optional `NEXT_PUBLIC_SITE_URL` custom-domain override.
7. Deploy, then complete the desktop and mobile smoke checks in [the pre-deployment checklist](docs/pre-deployment-checklist.md).

No `vercel.json`, custom server, output-directory override, database, or external service is required.
