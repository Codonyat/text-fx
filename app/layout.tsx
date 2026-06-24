import type { Metadata } from "next";
import { GOOGLE_FONTS_HREF } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEXT-FX — Random CSS Text Effects Generator",
  description:
    "Shuffle, tune, and copy 280+ pure-CSS text effects — neon, gradient, chrome, glitch, 3D, fire and more. Export CSS, HTML, JSX, PNG or a share link.",
  applicationName: "TEXT-FX",
  keywords: [
    "CSS text effects",
    "text effect generator",
    "neon text CSS",
    "gradient text",
    "glitch text",
    "CSS generator",
  ],
  openGraph: {
    title: "TEXT-FX — Random CSS Text Effects Generator",
    description:
      "Generate, tune and export 280+ pure-CSS text effects. Built for coders who want cool typography fast.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
