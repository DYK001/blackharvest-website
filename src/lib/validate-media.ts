import type {
  DevlogMediaBlock,
  MediaAsset,
  MediaManifest,
  MediaRole,
} from "@/types/media";

const imageExtensions = new Set([".avif", ".webp", ".png", ".jpg", ".jpeg"]);
const videoExtensions = new Set([".webm", ".mp4"]);
const firstPartyRoot = "/media/blackharvest/";

export interface KnownDevlog {
  slug: string;
  sectionHeadings: readonly string[];
}

export interface MediaValidationContext {
  knownDevlogs: readonly KnownDevlog[];
  fileExists?: (src: string) => boolean;
  fileSize?: (src: string) => number | undefined;
}

export interface MediaValidationResult {
  issues: string[];
  warnings: string[];
}

function extensionOf(src: string) {
  const clean = src.split(/[?#]/, 1)[0].toLowerCase();
  const dot = clean.lastIndexOf(".");
  return dot >= 0 ? clean.slice(dot) : "";
}

function validateLocalPath(src: string, context: string) {
  const issues: string[] = [];

  if (
    !src.startsWith(firstPartyRoot) ||
    src.includes("..") ||
    src.includes("\\") ||
    src.includes("?") ||
    src.includes("#")
  ) {
    issues.push(
      `${context} must use a clean repository-local path under ${firstPartyRoot}`,
    );
  }

  return issues;
}

function validateAssetReference(
  id: string,
  context: string,
  assetsById: ReadonlyMap<string, MediaAsset>,
  issues: string[],
  options?: { type?: MediaAsset["type"]; role?: MediaRole },
) {
  const asset = assetsById.get(id);

  if (!asset) {
    issues.push(`${context} references unknown media asset: ${id}`);
    return undefined;
  }

  if (!asset.public) {
    issues.push(`${context} references non-public media asset: ${id}`);
  }

  if (options?.type && asset.type !== options.type) {
    issues.push(`${context} requires ${options.type} media: ${id}`);
  }

  if (options?.role && !asset.roles.includes(options.role)) {
    issues.push(`${context} media is missing the ${options.role} role: ${id}`);
  }

  return asset;
}

function validateDevlogBlock(
  block: DevlogMediaBlock,
  context: string,
  sectionHeadings: ReadonlySet<string>,
  assetsById: ReadonlyMap<string, MediaAsset>,
  issues: string[],
) {
  if (block.sectionHeading && !sectionHeadings.has(block.sectionHeading)) {
    issues.push(
      `${context} references unknown section heading: ${block.sectionHeading}`,
    );
  }

  if (block.kind === "asset") {
    validateAssetReference(block.assetId, context, assetsById, issues, {
      role: "devlog",
    });
    return;
  }

  validateAssetReference(
    block.beforeId,
    `${context} before image`,
    assetsById,
    issues,
    { type: "image", role: "devlog" },
  );
  validateAssetReference(
    block.afterId,
    `${context} after image`,
    assetsById,
    issues,
    { type: "image", role: "devlog" },
  );

  if (!block.beforeLabel.trim() || !block.afterLabel.trim()) {
    issues.push(`${context} comparison requires before and after labels`);
  }
}

export function validateMediaManifest(
  manifest: MediaManifest,
  context: MediaValidationContext,
): MediaValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const assetsById = new Map<string, MediaAsset>();

  for (const asset of manifest.assets) {
    if (assetsById.has(asset.id)) {
      issues.push(`Duplicate media asset id: ${asset.id}`);
    }
    assetsById.set(asset.id, asset);

    if (!asset.id.trim()) issues.push("Media asset id cannot be empty");
    if (!asset.alt.trim()) issues.push(`Media asset requires alt text: ${asset.id}`);
    if (asset.width <= 0 || asset.height <= 0) {
      issues.push(`Media asset requires positive dimensions: ${asset.id}`);
    }
    if (asset.roles.length === 0) {
      issues.push(`Media asset requires at least one role: ${asset.id}`);
    }

    issues.push(...validateLocalPath(asset.src, `Media asset ${asset.id}`));

    const extension = extensionOf(asset.src);
    const allowedExtensions = asset.type === "image" ? imageExtensions : videoExtensions;
    if (!allowedExtensions.has(extension)) {
      issues.push(
        `Unsupported ${asset.type} extension for ${asset.id}: ${extension || "none"}`,
      );
    }

    if (context.fileExists && !context.fileExists(asset.src)) {
      issues.push(`Configured media file does not exist: ${asset.src}`);
    }

    if (asset.type === "video" && asset.poster) {
      issues.push(...validateLocalPath(asset.poster, `Video poster ${asset.id}`));
      const posterExtension = extensionOf(asset.poster);
      if (!imageExtensions.has(posterExtension)) {
        issues.push(
          `Unsupported poster extension for ${asset.id}: ${posterExtension || "none"}`,
        );
      }
      if (context.fileExists && !context.fileExists(asset.poster)) {
        issues.push(`Configured video poster does not exist: ${asset.poster}`);
      }
    } else if (asset.type === "video") {
      warnings.push(`Video has no poster: ${asset.id}`);
    }

    const size = context.fileSize?.(asset.src);
    if (size !== undefined) {
      if (
        asset.type === "image" &&
        asset.roles.includes("hero") &&
        size > 15 * 1024 * 1024
      ) {
        warnings.push(`Hero image is larger than 15 MB: ${asset.id}`);
      }
      if (asset.type === "video" && size > 50 * 1024 * 1024) {
        warnings.push(`Video is larger than 50 MB: ${asset.id}`);
      }
    }
  }

  if (manifest.hero.videoId) {
    const video = validateAssetReference(
      manifest.hero.videoId,
      "Hero video",
      assetsById,
      issues,
      { type: "video", role: "hero" },
    );
    if (video?.type === "video" && !video.poster) {
      issues.push(`Hero video requires a poster: ${video.id}`);
    }
  }

  if (manifest.hero.imageId) {
    validateAssetReference(
      manifest.hero.imageId,
      "Hero image",
      assetsById,
      issues,
      { type: "image", role: "hero" },
    );
  }

  const homepageIds = new Set<string>();
  for (const id of manifest.homepage.assetIds) {
    if (homepageIds.has(id)) {
      issues.push(`Duplicate homepage media reference: ${id}`);
    }
    homepageIds.add(id);
    validateAssetReference(id, "Homepage showcase", assetsById, issues, {
      role: "showcase",
    });
  }

  if (manifest.socialPreviewId) {
    validateAssetReference(
      manifest.socialPreviewId,
      "Social preview",
      assetsById,
      issues,
      { type: "image", role: "social-preview" },
    );
  }

  const knownDevlogs = new Map(
    context.knownDevlogs.map((entry) => [
      entry.slug,
      new Set(entry.sectionHeadings),
    ]),
  );

  for (const [slug, blocks] of Object.entries(manifest.devlogs)) {
    const sectionHeadings = knownDevlogs.get(slug);
    if (!sectionHeadings) {
      issues.push(`Media manifest references unknown development log: ${slug}`);
      continue;
    }

    blocks.forEach((block, index) =>
      validateDevlogBlock(
        block,
        `Development log media ${slug}[${index}]`,
        sectionHeadings,
        assetsById,
        issues,
      ),
    );
  }

  return { issues, warnings };
}
