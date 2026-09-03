import type { MediaManifest } from "@/types/media";

/**
 * First-party media configuration.
 *
 * Keep this empty until approved BlackHarvest files have been copied into
 * public/media/blackharvest. Presentation components resolve all media from
 * this manifest, so adding or replacing an asset should not require JSX edits.
 */
export const mediaManifest: MediaManifest = {
  assets: [
    {
      id: "settlement-path-first-concept",
      type: "image",
      src: "/media/blackharvest/screenshots/1차컨셉.png",
      alt: "Third-person character holding an axe on a path between timber buildings, with fenced trees and mountains ahead.",
      caption: "Early world concept — a timber settlement and surrounding landscape.",
      category: "world",
      roles: ["hero", "showcase"],
      width: 1672,
      height: 941,
      focalPosition: {
        desktop: "50% 50%",
        tablet: "43% 50%",
        mobile: "40% 50%",
      },
      source: "first-party",
      public: true,
    },
    {
      id: "combat-test-capture",
      type: "video",
      src: "/media/blackharvest/gameplay/전투임시.mp4",
      poster: "/media/blackharvest/derived/combat-test-poster.png",
      alt: "Two humanoid characters face one another in a gray grid-based test environment during a gameplay capture.",
      caption: "Combat test capture in a development environment.",
      category: "development",
      roles: ["showcase"],
      width: 1980,
      height: 1080,
      source: "first-party",
      public: true,
    },
  ],
  hero: {
    imageId: "settlement-path-first-concept",
  },
  homepage: {
    assetIds: ["settlement-path-first-concept", "combat-test-capture"],
  },
  devlogs: {},
};
