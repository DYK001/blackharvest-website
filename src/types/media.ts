export type MediaType = "image" | "video";

export type MediaRole =
  | "hero"
  | "showcase"
  | "devlog"
  | "social-preview";

export type MediaCategory =
  | "world"
  | "combat"
  | "character"
  | "development"
  | "interface";

export type MediaSource = "first-party";

export interface MediaCredit {
  label: string;
  note?: string;
}

export interface MediaFocalPosition {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

interface BaseMediaAsset {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category?: MediaCategory;
  roles: MediaRole[];
  width: number;
  height: number;
  source: MediaSource;
  credit?: MediaCredit;
  focalPosition?: MediaFocalPosition;
  public: boolean;
}

export interface ImageMediaAsset extends BaseMediaAsset {
  type: "image";
}

export interface VideoMediaAsset extends BaseMediaAsset {
  type: "video";
  poster?: string;
}

export type MediaAsset = ImageMediaAsset | VideoMediaAsset;

export type DevlogMediaBlock =
  | {
      kind: "asset";
      assetId: string;
      sectionHeading?: string;
    }
  | {
      kind: "comparison";
      beforeId: string;
      afterId: string;
      beforeLabel: string;
      afterLabel: string;
      caption?: string;
      sectionHeading?: string;
    };

export interface MediaManifest {
  assets: MediaAsset[];
  hero: {
    videoId?: string;
    imageId?: string;
  };
  homepage: {
    assetIds: string[];
  };
  socialPreviewId?: string;
  devlogs: Record<string, DevlogMediaBlock[]>;
}
