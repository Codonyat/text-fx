import type { EffectDefinition } from "@/lib/engine/types";

/** SEO/GEO-grade prose per effect (keyed by id). Keeps effect files focused. */
export const EFFECT_DESCRIPTIONS: Record<string, string> = {
  // neon-glow
  "neon-glow":
    "The classic neon tube: layered text-shadows build a bright core with a colored halo, plus an optional broken-sign flicker. Reads beautifully on dark backgrounds.",
  "dual-neon":
    "A neon sign with two stacked glows — a tight inner halo in your hue and a wide outer halo in a complementary color. Built entirely from layered text-shadows.",
  "pulse-glow":
    "A neon glow that gently breathes in and out via an animated text-shadow. Calm, sub-1Hz pulsing that draws the eye without being distracting.",
  "soft-glow":
    "A subtle ambient halo from a few low-blur text-shadow layers in a single hue, with no hot white core. Great for a soft, premium glow on headings.",
  // gradient-fill
  "gradient-flow":
    "A multi-stop gradient clipped to the text that slowly flows by animating its background position. The go-to lively gradient headline.",
  "conic-spin":
    "A conic gradient clipped to the letters that rotates forever using an animated @property angle. A modern, hypnotic color wheel through your text.",
  "duotone-fill":
    "A crisp two-color split gradient filling the glyphs via background-clip. Bold, poster-like, and endlessly recolorable by hue.",
  "rainbow-fill":
    "Full-spectrum rainbow piped through the letters with background-clip:text. Playful and instantly eye-catching; angle and saturation are adjustable.",
  "mesh-gradient":
    "Four soft color blobs blended into a smooth mesh and clipped to the glyphs, with an optional slow drift. A modern, multi-directional gradient fill.",
  // metallic-holographic
  chrome:
    "A vertical metallic gradient clipped to the text with a soft drop-shadow for that shiny chrome bevel. Tint it warm or cool with a single control.",
  "gold-foil":
    "Classic gold foil — a warm vertical metallic gradient with bright specular bands and a grounding shadow. Luxe lettering for logos and titles.",
  holographic:
    "Iridescent foil that shifts hue continuously via an animated @property angle on a conic gradient. That holographic-sticker shimmer, in pure CSS.",
  "shine-sweep":
    "A metallic base with a bright highlight bar that sweeps across the text on a loop. Adds a premium glint to any wordmark.",
  // threed-depth
  "extrude-3d":
    "Stacked offset text-shadows build a solid 3D extrusion with depth and direction controls, plus an optional float. The quintessential chunky 3D title.",
  "isometric-3d":
    "An isometric extrude at a fixed 2:1 pixel-art angle, with a lightness gradient down the side wall for real iso depth. Retro-game energy.",
  "long-shadow":
    "A flat, fading long shadow cast at any angle from a trail of offset text-shadow layers. The clean flat-design depth cue.",
  "retro-3d":
    "Two-tone 80s 3D — a bright face over a saturated offset slab with a contrast outline. Bold arcade/retro headline energy.",
  "paper-cutout":
    "Stacked offset layers in graduated paper tones with a soft lifted shadow, for a layered paper-craft cut-out. Tactile depth without a flat extrude.",
  // outline-stroke
  outline:
    "Hollow outline text via -webkit-text-stroke, with an optional offset echo shadow. Minimal, editorial and lightweight.",
  "filled-outline":
    "A solid fill with a thick contrasting stroke via -webkit-text-stroke and paint-order. Comic-cover legibility with independent fill and stroke colors.",
  "double-outline":
    "Hollow text ringed by two concentric outlines built from hard text-shadows, the inner and outer rings in distinct hues. Sticker-like and punchy.",
  "gradient-stroke":
    "Transparent letters with a tinted outline plus a gradient glow copy behind, so the stroke reads as colorful. Outline art with depth.",
  // glitch-distortion
  "glitch-rgb":
    "The classic RGB-split glitch: cyan/magenta pseudo-element copies tear and shift on clip-path keyframes. Cyberpunk in a single class (needs a data-text attribute).",
  "shake-glitch":
    "Cyan/magenta copies jitter out of sync for a nervous, broken-signal glitch — no clipping, just chromatic shake. Tunable shift and speed.",
  "scanline-glitch":
    "CRT-style scanlines over the text with a subtle flicker. Adds a retro-monitor texture without obscuring the letters.",
  vhs: "VHS chroma-bleed: offset color copies, vertical jitter and scanlines for that worn-tape look. Lo-fi nostalgia for titles.",
  // retro-themed
  sticker:
    "A white fill with a bold colored stroke and a hard drop-shadow — the die-cut sticker look. paint-order keeps thick strokes clean.",
  vaporwave:
    "A pink-to-cyan gradient title with a soft, dreamy glow. The signature 80s/synthwave aesthetic in pure CSS.",
  "pixel-8bit":
    "Blocky 8-bit lettering faked with hard stepped text-shadows and crisp edges. An instant retro-game headline.",
  "candy-stripe":
    "Diagonal candy-cane stripes filling the glyphs via a repeating gradient clip. Sweet, festive and fully recolorable.",
  "comic-pop":
    "A bright fill with a heavy ink outline and a chained offset, for chunky comic-book pop. paint-order keeps the face crisp over the stroke.",
  "distress-stamp":
    "A solid ink run through an SVG filter that roughens the edges and punches noise holes, for a worn rubber-stamp look. Grungy and tunable.",
  // shadow-press
  "drop-shadow":
    "A simple soft drop shadow under solid text, with blur and distance controls. The dependable, readable depth cue.",
  "hard-offset":
    "A flat, hard offset shadow with no blur — bold retro-poster depth in a single solid color.",
  "long-45":
    "A dramatic 45° cast shadow that stretches and fades behind the text. More theatrical than a flat long shadow.",
  letterpress:
    "A pressed-in letterpress look: a light highlight and a dark inset that match the background tone. Subtle, classy and theme-aware.",
  emboss:
    "A raised, embossed relief created with opposing light and dark text-shadows that adapt to the theme. A tactile, debossed-paper feel.",
  // elemental
  fire: "Flickering flame text built from layered orange/red/yellow glows that dance on a loop. Hot, animated and attention-grabbing.",
  ice: "Crystalline ice — a cool blue gradient fill with a frosty stroke and a cold shadow. Wintry and clean.",
  aurora:
    "A flowing green-teal-violet aurora gradient clipped to the text, drifting via an animated @property hue. Northern-lights motion for headlines.",
  gooey:
    "A goo/blob morph using an SVG Gaussian-blur and color-matrix gooey filter. Liquid, organic lettering.",
  "water-fill":
    "Hollow stroked glyphs with a waterline that rises and falls via an animated @property level. A liquid fill that ebbs like a tide.",
  // fill-texture
  "image-fill":
    "Glyphs filled with a rich multi-gradient that reads like a photographic texture, via background-clip:text. An image-in-text look with zero assets.",
  starfield:
    "Letters filled with a deep-space starfield — a radial-dot star pattern over a dark gradient. Cosmic titles in pure CSS.",
  "stripe-fill":
    "Bold repeating diagonal stripes filling the glyphs. Graphic, high-contrast and recolorable by hue and angle.",
  "halftone-dots":
    "A pop-art halftone dot grid over a two-tone base, clipped to the text and gently drifting. Comic-print texture in pure CSS.",
  "camouflage-fill":
    "Soft multiply-blended blobs in army, desert, navy or urban palettes, clipped to the glyphs. A textured camo material fill.",
  // entrance-kinetic
  "fade-in":
    "The whole word fades and gently rises into place on load. A tasteful, universal entrance animation.",
  typewriter:
    "A typing reveal with a blinking caret, using a stepped clip-path animation. The familiar terminal/typewriter entrance.",
  "stagger-reveal":
    "Characters fade and rise in one after another for a staggered cascade reveal. Great for hero headlines (wraps each character in a span).",
  "letter-wave":
    "Letters bob in a continuous sine wave, each offset by its index for a flowing ripple. Lively kinetic typography (per-letter markup).",
  "jelly-wobble":
    "Per-letter squash-and-stretch that wobbles across the word like gel, anchored to the baseline. Playful kinetic typography (per-letter markup).",
  "blur-focus-in":
    "The word resolves out of a soft blur as opacity rises and wide tracking draws together. A cinematic focus-in entrance.",
  // decoration-underline
  "slide-underline":
    "A gradient underline bar grows in from the left beneath the text. Clean, modern link and heading emphasis.",
  "wavy-underline":
    "A colored wavy squiggle underline via text-decoration. Friendly, informal emphasis.",
  highlighter:
    "A marker highlight sweeps in behind the text like a felt-tip pen. Draws attention to a phrase with a hand-made feel.",
  "gradient-underline":
    "A full-width underline bar whose gradient hue cycles continuously via an animated @property. A flowing, colorful heading underline.",
  // interactive-advanced
  "hover-spotlight":
    "A radial spotlight reveals the colored text on hover using a CSS mask — no JavaScript. An interactive flashlight reveal.",
  "mirror-reflection":
    "Text with a faded mirror reflection below via -webkit-box-reflect and a gradient mask. A glossy, modern sheen.",
  "echo-trail":
    "Hue-shifted fading clones trail behind the drifting word for a clean motion after-image. An echo trail, not a chromatic glitch.",
  "hover-ripple":
    "Hovering sends a wave of lift and color rippling through the letters via per-letter delays, with a resting twinkle. Interactive, no JavaScript.",
};

/** Full description with a sensible fallback. */
export function describe(effect: Pick<EffectDefinition, "id" | "name" | "tags">): string {
  return (
    EFFECT_DESCRIPTIONS[effect.id] ??
    `${effect.name} — a ${effect.tags.includes("animated") ? "animated" : "static"} pure-CSS text effect you can tune, copy and export.`
  );
}

/** A ~155-char description suitable for a <meta> tag. */
export function metaDescription(effect: Pick<EffectDefinition, "id" | "name" | "tags">): string {
  const text = describe(effect);
  if (text.length <= 155) return text;
  const firstSentence = text.split(/(?<=[.!?])\s/)[0];
  if (firstSentence.length <= 155) return firstSentence;
  return text.slice(0, 154).trimEnd() + "…";
}
