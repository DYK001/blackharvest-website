import type { CSSProperties } from "react";
import Image from "next/image";
import { getMediaMimeType } from "@/lib/media";
import type { MediaAsset } from "@/types/media";
import { getDictionary, getMediaLabel, type Locale } from "@/i18n";

interface MediaFrameProps {
  asset: MediaAsset;
  sizes: string;
  label?: string;
  className?: string;
  locale: Locale;
}

export function MediaFrame({ asset, sizes, label, className, locale }: MediaFrameProps) {
  const dictionary = getDictionary(locale);
  const style = {
    "--media-aspect": `${asset.width} / ${asset.height}`,
  } as CSSProperties;
  const visibleLabel =
    label ?? getMediaLabel(locale, asset);

  return (
    <figure
      className={["media-frame", className].filter(Boolean).join(" ")}
      style={style}
    >
      {visibleLabel ? (
        <span className="media-frame__label">{visibleLabel}</span>
      ) : null}
      <div className="media-frame__surface" data-reveal="fade" data-depth={asset.type === "image" ? "image" : undefined}>
        {asset.type === "image" ? (
          <Image
            src={asset.src}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            sizes={sizes}
          />
        ) : (
          <video
            controls
            playsInline
            preload="none"
            poster={asset.poster}
            aria-label={asset.alt}
          >
            <source src={asset.src} type={getMediaMimeType(asset)} />
            {dictionary.media.unsupportedVideo}
          </video>
        )}
      </div>
      {asset.caption || asset.credit ? (
        <figcaption data-reveal="fade">
          {asset.caption ? <span>{asset.caption}</span> : null}
          {asset.credit ? (
            <small>
              {dictionary.media.credit}: {asset.credit.label}
              {asset.credit.note ? ` — ${asset.credit.note}` : ""}
            </small>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
