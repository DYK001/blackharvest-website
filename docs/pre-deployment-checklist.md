# BlackHarvest pre-deployment checklist

Run this checklist from the repository root before uploading to GitHub and again before a production deployment.

## Repository and content

- [ ] Confirm the approved first-party image, combat video, and poster are present under `public/media/blackharvest/`.
- [ ] Confirm all paths in `src/data/media.ts` resolve with `npm run media:check`.
- [ ] Confirm `.next/`, `node_modules/`, `.status-backups/`, `review/`, environment files, logs, and temporary files remain Git-ignored.
- [ ] Scan committed/build-relevant files for secrets, credentials, private addresses, local usernames, and absolute machine or Unreal project paths.
- [ ] Confirm public project status still matches the verified structured data; do not publish website deployment work as gameplay progress.

## Required validation

- [ ] `npm run test:status`
- [ ] `npm run status:check`
- [ ] `npm run test:media`
- [ ] `npm run media:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `git diff --check`
- [ ] Start the production build with `npm run start` and smoke-test the homepage plus all four `/devlog/[slug]` routes.

## GitHub and Vercel

- [ ] Choose public or private GitHub visibility. Public exposes committed source and media; private access depends on the user's Git provider and Vercel account permissions.
- [ ] Upload or push the repository to GitHub without local-only artifacts.
- [ ] Import the repository into Vercel, keep automatic Next.js detection, set the install command to `npm ci`, and confirm the build command is `npm run build`.
- [ ] Leave environment variables empty unless supplying the optional `NEXT_PUBLIC_SITE_URL` custom-domain override.
- [ ] After deployment, smoke-test desktop and mobile layouts, navigation anchors, fonts, metadata, the Hero image, Field Records image, and combat video/poster; check the browser console for errors.
