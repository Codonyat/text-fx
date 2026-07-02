import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the OG font is bundled for the image-generation routes.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./lib/og/**"],
    "/effects/opengraph-image": ["./lib/og/**"],
    "/effects/[id]/opengraph-image": ["./lib/og/**"],
  },
};

export default nextConfig;
