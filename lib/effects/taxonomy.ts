// Top-level categories for the gallery (from the research synthesis). Kept as a
// small hand-authored constant so the client bundle never imports catalog.json.

export interface Category {
  id: string;
  name: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { id: "neon-glow", name: "Neon & Glow", description: "Tube/halo light from stacked shadows — static, pulsing or flickering." },
  { id: "gradient-fill", name: "Gradient Fill", description: "Color piped through glyphs via background-clip:text — static or flowing." },
  { id: "metallic-holographic", name: "Metallic & Holographic", description: "Chrome, gold and iridescent foil sheens." },
  { id: "threed-depth", name: "3D & Depth", description: "Extrusion, isometric blocks, bevels and perspective." },
  { id: "outline-stroke", name: "Outline & Stroke", description: "Hollow, layered, gradient and self-drawing strokes." },
  { id: "glitch-distortion", name: "Glitch & Distortion", description: "Chromatic split, clip tearing, jitter and warp." },
  { id: "retro-themed", name: "Retro & Themed", description: "Vaporwave, comic, sticker, pixel, candy and more." },
  { id: "shadow-press", name: "Shadow & Press", description: "Drop/long/layered shadows, letterpress, emboss and engrave." },
  { id: "elemental", name: "Elemental & Nature", description: "Fire, ice, water, lava, smoke, aurora and lightning." },
  { id: "fill-texture", name: "Fill & Texture", description: "Glyphs filled with images, patterns, materials or textures." },
  { id: "entrance-kinetic", name: "Entrance & Kinetic", description: "On-load reveals and looping per-letter motion." },
  { id: "decoration-underline", name: "Underline & Decoration", description: "Animated/gradient/wavy underlines, highlights, reflections." },
  { id: "interactive-advanced", name: "Interactive & Advanced", description: "Pointer/scroll-driven, blend-mode and showpiece SVG." },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);
