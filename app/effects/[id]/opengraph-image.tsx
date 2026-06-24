import { ImageResponse } from "next/og";
import { spaceMono } from "@/lib/og/font";
import { EFFECTS, getEffect } from "@/lib/effects/registry";
import { CATEGORY_BY_ID } from "@/lib/effects/taxonomy";

export const runtime = "nodejs";
export const alt = "TEXT-FX text effect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return EFFECTS.map((e) => ({ id: e.id }));
}

export default async function EffectOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const effect = getEffect(id);
  const font = await spaceMono();
  const name = effect?.name ?? "Text Effect";
  const cat = effect ? CATEGORY_BY_ID[effect.category]?.name ?? effect.category : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0A0A0A",
          color: "#FAFAFA",
          fontFamily: "Space Mono",
        }}
      >
        <div style={{ fontSize: 26, color: "#8A8A8A", fontWeight: 700, letterSpacing: 4 }}>
          {`TEXT-FX · ${cat}`.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 118,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            textShadow: "0 0 14px #22e3ff, 0 0 52px #ff3ca6",
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 28, color: "#8A8A8A" }}>Copy the CSS · pure-CSS text effect</div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Space Mono", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
