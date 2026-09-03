import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0b0a", color: "#e8e0d1", border: "4px solid #741f20", fontSize: 22, fontWeight: 800, letterSpacing: 2 }}>BH</div>,
    size,
  );
}
