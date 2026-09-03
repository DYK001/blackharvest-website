import type { CSSProperties } from "react";
import Image from "next/image";
import { getMediaMimeType } from "@/lib/media";
import type { MediaAsset } from "@/types/media";

interface MediaFrameProps {
  asset: MediaAsset;
  sizes: string;
  label?: string;
  className?: string;
}

export function MediaFrame({ asset, sizes, label, className }: MediaFrameProps) {
  const style = {
    "--media-aspect": `${asset.width} / ${asset.height}`,
  } as CSSProperties;
  const visibleLabel =
    label ??
    (asset.category
      ? asset.category.replace(/(^|-)([a-z])/g, (_, separator, letter) =>
          `${separator === "-" ? " " : ""}${letter.toUpperCase()}`,
        )
      : undefined);

  return (
    <figure
      className={["media-frame", className].filter(Boolean).join(" ")}
      style={style}
    >
      {visibleLabel ? (
        <span className="media-frame__label">{visibleLabel}</span>
      ) : null}
      <div className="media-frame__surface">
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
            Your browser does not support this BlackHarvest video clip.
          </video>
        )}
      </div>
      {asset.caption || asset.credit ? (
        <figcaption>
          {asset.caption ? <span>{asset.caption}</span> : null}
          {asset.credit ? (
            <small>
              Credit: {asset.credit.label}
              {asset.credit.note ? ` — ${asset.credit.note}` : ""}
            </small>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
