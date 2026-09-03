import { mediaManifest } from "@/data/media";
import type {
  DevlogMediaBlock,
  ImageMediaAsset,
  MediaAsset,
  VideoMediaAsset,
} from "@/types/media";

const assetsById = new Map(
  mediaManifest.assets.map((asset) => [asset.id, asset]),
);

function getPublicAsset(id: string | undefined) {
  if (!id) return undefined;
  const asset = assetsById.get(id);
  return asset?.public ? asset : undefined;
}

export function getHeroMedia() {
  const video = getPublicAsset(mediaManifest.hero.videoId);
  const image = getPublicAsset(mediaManifest.hero.imageId);

  return {
    video:
      video?.type === "video" && video.poster
        ? (video as VideoMediaAsset)
        : undefined,
    image:
      image?.type === "image" ? (image as ImageMediaAsset) : undefined,
  };
}

export function getHomepageMedia() {
  return mediaManifest.homepage.assetIds
    .map((id) => getPublicAsset(id))
    .filter((asset): asset is MediaAsset => Boolean(asset));
}

export function getSocialPreviewMedia() {
  const asset = getPublicAsset(mediaManifest.socialPreviewId);
  return asset?.type === "image" ? asset : undefined;
}

export type ResolvedDevlogMediaBlock =
  | {
      kind: "asset";
      asset: MediaAsset;
    }
  | {
      kind: "comparison";
      before: ImageMediaAsset;
      after: ImageMediaAsset;
      beforeLabel: string;
      afterLabel: string;
      caption?: string;
    };

function resolveDevlogBlock(
  block: DevlogMediaBlock,
): ResolvedDevlogMediaBlock | undefined {
  if (block.kind === "asset") {
    const asset = getPublicAsset(block.assetId);
    return asset ? { kind: "asset", asset } : undefined;
  }

  const before = getPublicAsset(block.beforeId);
  const after = getPublicAsset(block.afterId);

  if (before?.type !== "image" || after?.type !== "image") return undefined;

  return {
    kind: "comparison",
    before,
    after,
    beforeLabel: block.beforeLabel,
    afterLabel: block.afterLabel,
    caption: block.caption,
  };
}

export function getDevlogMedia(
  slug: string,
  sectionHeading?: string,
): ResolvedDevlogMediaBlock[] {
  return (mediaManifest.devlogs[slug] ?? [])
    .filter((block) => block.sectionHeading === sectionHeading)
    .map(resolveDevlogBlock)
    .filter((block): block is ResolvedDevlogMediaBlock => Boolean(block));
}

export function getMediaMimeType(asset: MediaAsset | { src: string }) {
  const extension = asset.src.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "avif":
      return "image/avif";
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webm":
      return "video/webm";
    case "mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}
