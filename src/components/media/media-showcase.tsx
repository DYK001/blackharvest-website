import { MediaFrame } from "@/components/media/media-frame";
import { getHomepageMedia } from "@/lib/media";

export function MediaShowcase() {
  const assets = getHomepageMedia();

  if (assets.length === 0) return null;

  return (
    <section
      className="section-block media-showcase"
      id="media"
      aria-labelledby="media-heading"
    >
      <div className="shell">
        <header className="media-showcase__heading">
          <p className="eyebrow">
            <span aria-hidden="true" /> Field records
          </p>
          <h2 id="media-heading">From the world.</h2>
          <p>Visual records from the development of BlackHarvest.</p>
        </header>

        <div className="media-showcase__layout" data-count={assets.length}>
          {assets.map((asset, index) => (
            <MediaFrame
              asset={asset}
              className={index === 0 ? "media-frame--primary" : undefined}
              sizes={
                index === 0
                  ? "(max-width: 800px) 100vw, 68vw"
                  : "(max-width: 800px) 100vw, 32vw"
              }
              key={asset.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
