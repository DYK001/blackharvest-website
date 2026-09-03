import type { CSSProperties } from "react";
import Image from "next/image";
import { getHeroMedia, getMediaMimeType } from "@/lib/media";

export function HeroMedia() {
  const { video, image } = getHeroMedia();
  const mode = video ? "video" : image ? "image" : "css";
  const backgroundImage = image?.src ?? video?.poster;
  const focalPosition = (video ?? image)?.focalPosition;
  const style = {
    "--hero-media-position-desktop": focalPosition?.desktop ?? "50% 50%",
    "--hero-media-position-tablet":
      focalPosition?.tablet ?? focalPosition?.desktop ?? "50% 50%",
    "--hero-media-position-mobile":
      focalPosition?.mobile ?? focalPosition?.tablet ?? "50% 50%",
  } as CSSProperties;

  return (
    <div
      className="hero__media"
      data-media-mode={mode}
      style={style}
      aria-hidden="true"
    >
      <div className="hero__media-slot" data-media-ready="true" />

      {backgroundImage ? (
        <Image
          className="hero__media-asset hero__media-image"
          src={backgroundImage}
          alt=""
          fill
          sizes="100vw"
          preload
        />
      ) : null}

      {video ? (
        <video
          className="hero__media-asset hero__media-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={video.poster}
          disablePictureInPicture
        >
          <source
            src={video.src}
            type={getMediaMimeType(video)}
            media="(prefers-reduced-motion: no-preference)"
          />
        </video>
      ) : null}

      {mode !== "css" ? <div className="hero__media-treatment" /> : null}
      <div className="hero__haze hero__haze--one" />
      <div className="hero__haze hero__haze--two" />
      <div className="hero__grain" />
      <div className="hero__vignette" />
    </div>
  );
}
