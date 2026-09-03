# BlackHarvest media workflow

All public media must be approved first-party BlackHarvest material and must live
under `public/media/blackharvest/`. Media becomes visible only when referenced by
the typed manifest in `src/data/media.ts`.

## Adding a screenshot

1. Copy the file into `public/media/blackharvest/screenshots/`.
2. Add an image asset to `mediaManifest.assets` with an ID, repository-local path,
   meaningful alt text, dimensions, `source: "first-party"`, `public: true`, and
   the `showcase` role.
3. Add its ID to `mediaManifest.homepage.assetIds`.
4. Run `npm run media:check`.

The homepage showcase stays completely absent when its asset list is empty.
Replace every example value below with the real file details:

```ts
assets: [
  {
    id: "first-field-record",
    type: "image",
    src: "/media/blackharvest/screenshots/first-field-record.webp",
    alt: "Write factual alt text from the approved capture.",
    caption: "Add only a supplied, verified caption.",
    category: "world",
    roles: ["showcase"],
    width: 1920,
    height: 1080,
    source: "first-party",
    public: true,
  },
],
homepage: { assetIds: ["first-field-record"] },
```

## Adding hero key art

Add an image with the `hero` role, then set `mediaManifest.hero.imageId` to its
ID. The hero uses Next.js image optimization and keeps the CSS atmosphere beneath
the art as a safe fallback.

## Adding hero video

Add an MP4 or WebM asset with the `hero` role and a repository-local poster path,
then set `mediaManifest.hero.videoId`. Hero video is muted, looping, inline, and
metadata-preloaded. Reduced-motion visitors see the configured still/poster or
the CSS atmosphere instead of required motion.

Keep loops short and optimized. Monitor repository weight before committing real
video; do not add an external player or media host.

## Adding devlog imagery

Give an asset the `devlog` role, then add a block under
`mediaManifest.devlogs[devlogSlug]`. Omit `sectionHeading` for lead media, or use
an existing section heading to place it after that section. An `asset` block can
render an image or a controlled video clip.

For a before/after record, use a `comparison` block with two image IDs and honest,
supplied labels. It renders side-by-side on wide screens and stacks on mobile.

## Removing media

Remove every hero, homepage, social-preview, and devlog reference to the asset ID,
remove the manifest entry, then delete the file. Run the media check afterward.

## Running media validation

Run `npm run media:check`. It rejects missing files, duplicate IDs, unsupported
extensions, unsafe paths, missing hero-video posters, and invalid homepage,
hero, social-preview, or devlog references. The production build runs this check
automatically. Run `npm run test:media` for the focused media-layer tests.

## Recommended dimensions and formats

- Hero still: roughly 1920×1080 or larger source; AVIF or WebP preferred
- Screenshot: native gameplay capture where possible; AVIF, WebP, PNG, or JPEG
- Hero video: short optimized 1080p WebM or MP4 loop with a still poster
- Thumbnails: smaller optimized derivatives only when they materially save weight

These are practical targets, not rigid restrictions. Preserve the original image
ratio and supply its real pixel dimensions in the manifest.

## Accessibility requirements

Write meaningful alt text from known facts, never from a filename. Keep captions
optional and factual. Background hero media is decorative because the adjacent
hero copy provides the page meaning. Videos outside the hero use native controls,
do not autoplay, and retain an accessible label.

## Social preview

Add the `social-preview` role to one approved image and set
`mediaManifest.socialPreviewId`. The existing generated BlackHarvest preview stays
active when no designated asset is configured; arbitrary gameplay media is never
selected automatically.
