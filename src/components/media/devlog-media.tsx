import { MediaFrame } from "@/components/media/media-frame";
import { getDevlogMedia } from "@/lib/media";

interface DevlogMediaProps {
  slug: string;
  sectionHeading?: string;
}

export function DevlogMedia({ slug, sectionHeading }: DevlogMediaProps) {
  const blocks = getDevlogMedia(slug, sectionHeading);

  if (blocks.length === 0) return null;

  return (
    <div className="devlog-media" aria-label="Development media">
      {blocks.map((block, index) => {
        if (block.kind === "asset") {
          return (
            <MediaFrame
              asset={block.asset}
              sizes="(max-width: 1024px) 100vw, 780px"
              key={`${block.asset.id}-${index}`}
            />
          );
        }

        return (
          <div
            className="media-comparison"
            role="group"
            aria-label={
              block.caption ?? "Before and after development comparison"
            }
            key={`${block.before.id}-${block.after.id}-${index}`}
          >
            <div className="media-comparison__frames">
              <MediaFrame
                asset={block.before}
                label={block.beforeLabel}
                sizes="(max-width: 680px) 100vw, 390px"
              />
              <MediaFrame
                asset={block.after}
                label={block.afterLabel}
                sizes="(max-width: 680px) 100vw, 390px"
              />
            </div>
            {block.caption ? (
              <p className="media-comparison__caption">{block.caption}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
