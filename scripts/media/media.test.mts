import assert from "node:assert/strict";
import test from "node:test";
import { validateMediaManifest } from "../../src/lib/validate-media.ts";
import type { MediaManifest } from "../../src/types/media.ts";

const knownDevlogs = [
  { slug: "known-log", sectionHeadings: ["Foundation", "Validation"] },
];

const baseImage = {
  id: "world-still",
  type: "image" as const,
  src: "/media/blackharvest/screenshots/world.webp",
  alt: "A BlackHarvest world scene.",
  roles: ["showcase", "devlog"] as const,
  width: 1920,
  height: 1080,
  source: "first-party" as const,
  public: true,
};

function manifest(overrides: Partial<MediaManifest> = {}): MediaManifest {
  return {
    assets: [],
    hero: {},
    homepage: { assetIds: [] },
    devlogs: {},
    ...overrides,
  };
}

test("accepts an empty manifest and keeps the CSS hero fallback valid", () => {
  const result = validateMediaManifest(manifest(), {
    knownDevlogs,
    fileExists: () => false,
  });
  assert.deepEqual(result.issues, []);
});

test("rejects duplicate media IDs", () => {
  const asset = { ...baseImage, roles: [...baseImage.roles] };
  const result = validateMediaManifest(
    manifest({ assets: [asset, { ...asset }] }),
    { knownDevlogs, fileExists: () => true },
  );
  assert(result.issues.some((issue) => issue.includes("Duplicate media asset id")));
});

test("detects a missing configured local asset", () => {
  const result = validateMediaManifest(
    manifest({ assets: [{ ...baseImage, roles: [...baseImage.roles] }] }),
    { knownDevlogs, fileExists: () => false },
  );
  assert(result.issues.some((issue) => issue.includes("does not exist")));
});

test("rejects unsupported file extensions", () => {
  const result = validateMediaManifest(
    manifest({
      assets: [
        {
          ...baseImage,
          src: "/media/blackharvest/screenshots/world.bmp",
          roles: [...baseImage.roles],
        },
      ],
    }),
    { knownDevlogs, fileExists: () => true },
  );
  assert(
    result.issues.some((issue) =>
      issue.includes("Unsupported image extension"),
    ),
  );
});

test("requires a poster for a configured hero video", () => {
  const result = validateMediaManifest(
    manifest({
      assets: [
        {
          id: "hero-loop",
          type: "video",
          src: "/media/blackharvest/hero/hero.webm",
          alt: "BlackHarvest hero gameplay loop.",
          roles: ["hero"],
          width: 1920,
          height: 1080,
          source: "first-party",
          public: true,
        },
      ],
      hero: { videoId: "hero-loop" },
    }),
    { knownDevlogs, fileExists: () => true },
  );
  assert(result.issues.some((issue) => issue.includes("requires a poster")));
});

test("rejects invalid development-log media references", () => {
  const result = validateMediaManifest(
    manifest({
      devlogs: {
        "known-log": [
          {
            kind: "asset",
            assetId: "missing-asset",
            sectionHeading: "Unknown",
          },
        ],
      },
    }),
    { knownDevlogs, fileExists: () => true },
  );
  assert(result.issues.some((issue) => issue.includes("unknown media asset")));
  assert(
    result.issues.some((issue) => issue.includes("unknown section heading")),
  );
});
