import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { ImageResponse } from "next/og";
import { getMediaMimeType, getSocialPreviewMedia } from "@/lib/media";

const socialPreview = getSocialPreviewMedia();

export const alt =
  socialPreview?.alt ??
  "Black Harvest — Medieval Open-World Survival development record";
export const size = socialPreview
  ? { width: socialPreview.width, height: socialPreview.height }
  : { width: 1200, height: 630 };
export const contentType = socialPreview
  ? getMediaMimeType(socialPreview)
  : "image/png";

export default async function OpenGraphImage() {
  if (socialPreview) {
    const publicRoot = resolve(process.cwd(), "public");
    const filePath = resolve(
      publicRoot,
      socialPreview.src.replace(/^\/+/, ""),
    );

    if (!filePath.startsWith(`${publicRoot}${sep}`)) {
      throw new Error(
        "Social preview media resolved outside the public directory",
      );
    }

    const bytes = await readFile(filePath);
    return new Response(new Uint8Array(bytes), {
      headers: { "content-type": contentType },
    });
  }

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b0b0a", color: "#e8e0d1", padding: "72px 82px", borderTop: "12px solid #741f20" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#b7ad9d", fontSize: 22, letterSpacing: 7, textTransform: "uppercase" }}>
        <span style={{ width: 48, height: 2, background: "#9f3431" }} /> Official development record
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: "serif", fontSize: 120, lineHeight: .8, letterSpacing: -7, textTransform: "uppercase" }}>Black</div>
        <div style={{ fontFamily: "serif", fontSize: 120, lineHeight: .8, letterSpacing: -7, textTransform: "uppercase" }}>Harvest</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(232,224,209,.22)", paddingTop: 28, color: "#b7ad9d", fontSize: 24 }}>
        <span>Medieval Open-World Survival</span><span>In development</span>
      </div>
    </div>,
    size,
  );
}
