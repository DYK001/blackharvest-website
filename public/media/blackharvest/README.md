# BlackHarvest first-party media

Only approved BlackHarvest media belongs in this directory. Do not add stock art,
assets from another game, generated gameplay, or files copied automatically from
the Unreal project.

- `hero/` — approved hero stills, key art, short muted loops, and their posters
- `screenshots/` — public gameplay captures and world records for the homepage
- `devlog/` — development stills, clips, and before/after pairs used by articles

Files are not published merely because they are placed here. Add them to
`src/data/media.ts`, mark them public, and run `npm run media:check` before use.
