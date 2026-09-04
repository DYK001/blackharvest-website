import { MediaFrame } from "@/components/media/media-frame";
import { getDevlogMedia } from "@/lib/media";
import { getDictionary, getLocalizedMediaAsset, type Locale } from "@/i18n";

interface DevlogMediaProps {
  slug: string;
  sectionHeading?: string;
  locale: Locale;
}

export function DevlogMedia({ slug, sectionHeading, locale }: DevlogMediaProps) {
  const blocks = getDevlogMedia(slug, sectionHeading);
  const dictionary = getDictionary(locale);

  if (blocks.length === 0) return null;

  return (
    <div className="devlog-media" aria-label={dictionary.devlogArticle.developmentMedia}>
      {blocks.map((block, index) => {
        if (block.kind === "asset") {
          return (
            <MediaFrame
              asset={getLocalizedMediaAsset(locale, block.asset)}
              locale={locale}
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
              block.caption ?? dictionary.devlogArticle.comparison
            }
            key={`${block.before.id}-${block.after.id}-${index}`}
          >
            <div className="media-comparison__frames">
              <MediaFrame
                asset={getLocalizedMediaAsset(locale, block.before)}
                locale={locale}
                label={block.beforeLabel}
                sizes="(max-width: 680px) 100vw, 390px"
              />
              <MediaFrame
                asset={getLocalizedMediaAsset(locale, block.after)}
                locale={locale}
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
