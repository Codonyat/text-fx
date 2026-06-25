import { ImageResponse } from "next/og";
import { spaceMono } from "@/lib/og/font";

export const runtime = "nodejs";
export const alt = "TEXT-FX — Random CSS Text Effects Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const font = await spaceMono();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          background: "#0A0A0A",
          color: "#FAFAFA",
          fontFamily: "Space Mono",
        }}
      >
        <div
          style={{
            display: "flex",
            fontWeight: 700,
            fontSize: 150,
            letterSpacing: -2,
            textShadow: "0 0 14px #22e3ff, 0 0 44px #22e3ff, 0 0 90px #ff3ca6",
          }}
        >
          <span style={{ color: "#22e3ff" }}>TEXT</span>
          <span style={{ color: "#FAFAFA" }}>-</span>
          <span style={{ color: "#ff3ca6" }}>FX</span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>Random CSS Text Effects Generator</div>
        <div style={{ fontSize: 25, color: "#8A8A8A" }}>85 effects · pure CSS · copy & export</div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Space Mono", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
