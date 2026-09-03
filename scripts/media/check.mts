import { existsSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { developmentLogEntries } from "../../src/data/development-log.ts";
import { mediaManifest } from "../../src/data/media.ts";
import { validateMediaManifest } from "../../src/lib/validate-media.ts";

const publicRoot = resolve(process.cwd(), "public");
const mediaRoot = resolve(publicRoot, "media", "blackharvest");

function resolveMediaPath(src: string) {
  const candidate = resolve(publicRoot, src.replace(/^\/+/, ""));
  const isInsideMediaRoot = candidate.startsWith(`${mediaRoot}${sep}`);
  return isInsideMediaRoot ? candidate : undefined;
}

const result = validateMediaManifest(mediaManifest, {
  knownDevlogs: developmentLogEntries.map((entry) => ({
    slug: entry.slug,
    sectionHeadings: entry.sections.map((section) => section.heading),
  })),
  fileExists: (src) => {
    const filePath = resolveMediaPath(src);
    return Boolean(filePath && existsSync(filePath));
  },
  fileSize: (src) => {
    const filePath = resolveMediaPath(src);
    return filePath && existsSync(filePath) ? statSync(filePath).size : undefined;
  },
});

for (const warning of result.warnings) {
  console.warn(`MEDIA WARNING: ${warning}`);
}

if (result.issues.length > 0) {
  console.error("MEDIA CHECK FAILED");
  for (const issue of result.issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  const heroMode = mediaManifest.hero.videoId
    ? "video"
    : mediaManifest.hero.imageId
      ? "image"
      : "CSS fallback";
  console.log(
    `MEDIA CHECK PASSED: ${mediaManifest.assets.length} configured assets; hero mode: ${heroMode}.`,
  );
}
