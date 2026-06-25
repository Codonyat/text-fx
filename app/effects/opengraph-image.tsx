import { ImageResponse } from "next/og";
import { spaceMono } from "@/lib/og/font";
import { EFFECTS } from "@/lib/effects/registry";

export const runtime = "nodejs";
export const alt = "All CSS text effects on TEXT-FX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function EffectsOgImage() {
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
          gap: 24,
          background: "#0A0A0A",
          color: "#FAFAFA",
          fontFamily: "Space Mono",
        }}
      >
        <div style={{ fontSize: 26, color: "#8A8A8A", fontWeight: 700, letterSpacing: 4 }}>
          TEXT-FX
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 700,
            fontSize: 96,
            letterSpacing: -2,
            textShadow: "0 0 14px #22e3ff, 0 0 52px #ff3ca6",
          }}
        >
          All CSS Text Effects
        </div>
        <div style={{ fontSize: 30, color: "#8A8A8A" }}>
          {`${EFFECTS.length} effects · 13 categories · pure CSS`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Space Mono", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
