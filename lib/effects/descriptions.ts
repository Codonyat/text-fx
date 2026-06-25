import type { Capability, EffectDefinition } from "@/lib/engine/types";

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
  "color-cycle-glow":
    "A neon tube whose entire glow rotates through the spectrum via filter:hue-rotate. The classic layered-shadow halo, endlessly color-cycling.",
  "neon-sign-frame":
    "Glowing text inside a glowing rounded border box — outer and inset halos that breathe on a loop. A complete neon storefront sign.",
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
  "gradient-glow":
    "A flowing multi-stop gradient clipped to the text and lit from behind by a matching drop-shadow bloom. A gradient headline that radiates.",
  // metallic-holographic
  chrome:
    "A vertical metallic gradient clipped to the text with a soft drop-shadow for that shiny chrome bevel. Tint it warm or cool with a single control.",
  "gold-foil":
    "Classic gold foil — a warm vertical metallic gradient with bright specular bands and a grounding shadow. Luxe lettering for logos and titles.",
  holographic:
    "Iridescent foil that shifts hue continuously via an animated @property angle on a conic gradient. That holographic-sticker shimmer, in pure CSS.",
  "shine-sweep":
    "A metallic base with a bright highlight bar that sweeps across the text on a loop. Adds a premium glint to any wordmark.",
  "oil-slick":
    "A dark petrol iridescence — deep blue, violet, green and magenta in a slowly rotating conic sheen clipped to the text. Moodier than holographic foil.",
  "brushed-metal":
    "A tintable vertical metal ramp with fine vertical striations clipped to the glyphs. A matte machined-aluminium finish, distinct from glossy chrome.",
  "glass-frost":
    "A translucent glassy fill fading from bright to cool, edged with a thin light stroke and a frosty halo. Cool glassmorphism, theme-aware.",
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
  "perspective-tilt":
    "The word leans back into the page on a CSS 3D perspective with a stacked shadow extruding toward you. A solid slab receding in space.",
  "floating-3d":
    "The word hovers above the page, casting a large soft shadow far below while it gently bobs — levitation, not a tight drop shadow.",
  // outline-stroke
  outline:
    "Hollow outline text via -webkit-text-stroke, with an optional offset echo shadow. Minimal, editorial and lightweight.",
  "filled-outline":
    "A solid fill with a thick contrasting stroke via -webkit-text-stroke and paint-order. Comic-cover legibility with independent fill and stroke colors.",
  "double-outline":
    "Hollow text ringed by two concentric outlines built from hard text-shadows, the inner and outer rings in distinct hues. Sticker-like and punchy.",
  "gradient-stroke":
    "Transparent letters with a tinted outline plus a gradient glow copy behind, so the stroke reads as colorful. Outline art with depth.",
  "glow-outline":
    "Hollow letters with a bright colored stroke lit by a drop-shadow halo, plus an optional broken-sign flicker. A neon tube outline.",
  "outline-3d-extrude":
    "Hollow letters pushed into 3D by a stacked offset shadow in a deeper shade, so the outline itself reads as a chunky block.",
  // glitch-distortion
  "glitch-rgb":
    "The classic RGB-split glitch: cyan/magenta pseudo-element copies tear and shift on clip-path keyframes. Cyberpunk in a single class (needs a data-text attribute).",
  "shake-glitch":
    "Cyan/magenta copies jitter out of sync for a nervous, broken-signal glitch — no clipping, just chromatic shake. Tunable shift and speed.",
  "scanline-glitch":
    "CRT-style scanlines over the text with a subtle flicker. Adds a retro-monitor texture without obscuring the letters.",
  vhs: "VHS chroma-bleed: offset color copies, vertical jitter and scanlines for that worn-tape look. Lo-fi nostalgia for titles.",
  "block-glitch":
    "A solid word with a colored bar flickering across horizontal bands on stepped clip-path keyframes, plus a tiny positional jump. Blocky data-corruption energy.",
  "color-split":
    "Two offset duotone copies sit either side of a neutral core for a static chromatic-aberration print look. Recolorable; no jitter.",
  "terminal-phosphor":
    "Glowing CRT-monitor text with an irregular power-on flicker, like an old phosphor screen warming up and stuttering.",
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
  "balloon-puff":
    "Glossy inflated balloon lettering — a radial latex highlight clipped to the glyphs with a rounded edge and a gentle inflate-deflate pulse.",
  "cartoon-bubble":
    "A bright fill ringed by an inner white outline and a thick outer ink ring, built from stacked copies. The classic sticker/comic bubble.",
  "western-wood":
    "A vertical light-to-dark wood ramp with fine grain lines clipped to the glyphs, plus a carved edge — a saloon-sign plank.",
  "graffiti-spray":
    "A vivid multi-color fill wrapped in a soft spray haze and dropped with a hard offset, for bright stencil-tag street lettering.",
  "chalkboard":
    "Chalk-dust lettering with edges roughened by an SVG turbulence displacement and a faint dusty halo. White chalk on dark, charcoal on light.",
  "ransom-note":
    "Every letter is a cut-out chip with its own typeface, tilt and paper shade — the classic mismatched kidnapper-note collage (per-letter markup).",
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
  "rainbow-stack":
    "A flat face over a chain of hard offset shadows whose hue walks each step, building a candy-colored 3D ribbon behind the letters.",
  "engrave":
    "Letters carved into the surface — a low-contrast fill with a shadow on top and a highlight below (the inverse of emboss). Debossed and tactile.",
  // elemental
  fire: "Flickering flame text built from layered orange/red/yellow glows that dance on a loop. Hot, animated and attention-grabbing.",
  ice: "Crystalline ice — a cool blue gradient fill with a frosty stroke and a cold shadow. Wintry and clean.",
  aurora:
    "A flowing green-teal-violet aurora gradient clipped to the text, drifting via an animated @property hue. Northern-lights motion for headlines.",
  gooey:
    "A goo/blob morph using an SVG Gaussian-blur and color-matrix gooey filter. Liquid, organic lettering.",
  "water-fill":
    "Hollow stroked glyphs with a waterline that rises and falls via an animated @property level. A liquid fill that ebbs like a tide.",
  "molten-lava":
    "A bright hotspot drifts up and down through a yellow-orange-deep-red gradient clipped to the glyphs, with a warm glow. Molten and slow-flowing.",
  "smoke-drift":
    "Each letter softly blurs, lifts and fades then re-forms, offset per letter so a smoky haze rolls across the word. Stays legible (per-letter markup).",
  "lightning":
    "A cold electric-white core with a charged blue glow that crackles — erratic flicker with sudden bright spikes. Snappier than a steady neon.",
  "melt-drip":
    "A masked copy of the word oozes downward and fades on a loop, so the letters look like they're slowly melting off the baseline.",
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
  "scrolling-texture":
    "A fine two-tone crosshatch weave clipped to the text that scrolls diagonally on a loop. A moving woven material fill.",
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
  "flip-in-3d":
    "Each letter swings down into place around its baseline on a shared perspective, staggered with a slight overshoot. A crisp 3D on-load entrance (per-letter markup).",
  "falling-letters":
    "Letters drop in from above, squash on landing and settle, staggered by index. A bouncy gravity entrance (per-letter markup).",
  "rainbow-letters":
    "Each glyph takes a hue stepped by its index while the whole word cycles through the spectrum via hue-rotate. A flowing rainbow (per-letter markup).",
  "mask-wipe":
    "A soft-edged gradient mask sweeps across the word, wiping it into view and back out on a loop. A smooth reveal entrance.",
  // decoration-underline
  "slide-underline":
    "A gradient underline bar grows in from the left beneath the text. Clean, modern link and heading emphasis.",
  "wavy-underline":
    "A colored wavy squiggle underline via text-decoration. Friendly, informal emphasis.",
  highlighter:
    "A marker highlight sweeps in behind the text like a felt-tip pen. Draws attention to a phrase with a hand-made feel.",
  "gradient-underline":
    "A full-width underline bar whose gradient hue cycles continuously via an animated @property. A flowing, colorful heading underline.",
  "marching-underline":
    "A dashed underline rule that marches steadily beneath the text via an animated background position. The text stays fully legible throughout.",
  "center-grow-underline":
    "A solid underline bar grows outward from the center to full width, holds, then retracts. Origin-from-center sets it apart from slide and dash underlines.",
  "strike-through":
    "A colored line draws itself across the middle of the text, holds, then retracts — a looping strikethrough, set apart from the underlines.",
  // interactive-advanced
  "hover-spotlight":
    "A radial spotlight reveals the colored text on hover using a CSS mask — no JavaScript. An interactive flashlight reveal.",
  "mirror-reflection":
    "Text with a faded mirror reflection below via -webkit-box-reflect and a gradient mask. A glossy, modern sheen.",
  "echo-trail":
    "Hue-shifted fading clones trail behind the drifting word for a clean motion after-image. An echo trail, not a chromatic glitch.",
  "hover-ripple":
    "Hovering sends a wave of lift and color rippling through the letters via per-letter delays, with a resting twinkle. Interactive, no JavaScript.",
  "hover-glint":
    "A bright diagonal highlight sweeps across the word on hover, like light catching glass. CSS-only, no JavaScript; the resting state is clean.",
  "hover-depth-3d":
    "The word lies flat until hovered, then pops up off the page as a stacked shadow extrudes underneath. CSS-only interactive depth.",
  "liquid-warp":
    "An SVG turbulence + displacement filter wobbles the glyph edges, animated so the letters ripple like they're underwater. A liquid showpiece.",
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

/** Human-readable note for each special capability (pure = no note). */
const CAP_NOTES: Record<Capability, string> = {
  pure: "",
  perLetter:
    "Each character is wrapped in its own span so it can animate independently — the HTML and JSX exports include that per-letter markup.",
  svgDefs:
    "It relies on an inline SVG <defs> block (filters, gradients or clip-paths), which the HTML export carries alongside the CSS.",
  dataText:
    "A data-text attribute mirrors the word into ::before/::after layers, so copy that attribute together with the CSS.",
  property:
    "It animates a registered CSS @property, which keeps the motion smooth and GPU-friendly.",
  pointer:
    "It reacts to the pointer through CSS custom properties updated by a tiny inline script.",
  scroll: "It is driven by a scroll-linked animation timeline.",
};

function formatList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** A short, accurate "how it works" paragraph derived from the effect's own metadata. */
export function howItWorks(
  effect: Pick<EffectDefinition, "name" | "tags" | "caps">,
  categoryName: string,
): string {
  const animated = effect.tags.includes("animated");
  const base = `${effect.name} is ${animated ? "an animated" : "a static"} ${categoryName.toLowerCase()} text effect rendered entirely in CSS.`;
  const notes = effect.caps
    .filter((c) => c !== "pure")
    .map((c) => CAP_NOTES[c])
    .filter(Boolean);
  const markup = notes.length
    ? " " + notes.join(" ")
    : " It works on a single element — just add the .text-effect class, with no extra HTML.";
  return base + markup;
}

/** A short "controls" paragraph listing the effect's own tunable controls. */
export function controlsSummary(effect: Pick<EffectDefinition, "name" | "controls">): string {
  const labels = effect.controls.map((c) => c.label);
  if (!labels.length) {
    return `${effect.name} uses the shared type controls — font, weight, letter-spacing and case. Open it in the generator to tune it live, then copy the updated CSS.`;
  }
  const noun = labels.length > 1 ? "controls" : "control";
  return `${effect.name} exposes ${labels.length} dedicated ${noun} — ${formatList(labels)} — on top of the shared type controls (font, weight, letter-spacing and case). Open it in the generator to tune every value live, then copy the updated CSS.`;
}
