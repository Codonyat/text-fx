# TEXT-FX Effect Gap Report

_Generated 2026-07-02 by a multi-agent investigation: 3 reconciliation agents (Sonnet) fuzzy-matched all 280 catalog entries against the 116 built effects; 5 research agents (4 Opus + 1 Sonnet) hunted the wider CSS world through distinct lenses (canon sweep, modern-CSS platform, typography-native, underweighted styles, interaction/pseudo tricks); a judge pass (Fable) deduplicated, gated feasibility, and ranked. Companion data: the 42 vetted new ideas live in catalog.json under tiers.v2Candidates._

## Headline findings

1. **Coverage is good but not done**: 200 of 280 catalog entries are substantially covered by the built 116 (98 exact, 70 strong, 32 partial). **87 catalog entries remain open gaps** (80 unmatched + 7 high-wow partials promoted after re-adjudication), plus **42 newly researched candidates** = **129 open ideas**.
2. **The scroll lane is completely untapped**: the engine fully supports a scroll capability (animation-timeline: scroll()/view()), but zero of 116 effects use it. 3 catalog entries + 6 new v2 candidates target it — the single biggest coherent expansion opportunity.
3. **retro-themed is the thinnest category** (4 built vs 23 entrance-kinetic). 9 of the 42 new candidates land there (art deco, marquee bulbs, HUD, stencil, cassette futurism, blueprint, airbrush, Honk, die-cut chips), plus the thematically adjacent Win-95 bevel in shadow-press.
4. **COLRv1 color fonts are a whole missing technology lane**: font-palette / @font-palette-values with Nabla, Foldit, Honk, Rocher — absent from both the built set and the original catalog. High wow, low implementation risk (the font does the heavy lifting), but each needs a font-family addition.
5. **The original catalog is inflated by internal duplication**: 31 duplicate clusters (~60 entries are re-descriptions of the same visual concept under different section labels). The real distinct-concept count is meaningfully below 280 — the coverage ratio is better than it looks.
6. **18 built effects have no catalog row** (house originals beyond the research catalog): marching-underline, scribble-underline, heat-haze, ink-bleed, bulge-text, casual-morph, fan-text, kerning-drift, slope-text, zigzag-text, soft-duotone, spotlight, focus-lens, glare-sweep, glass-pill, sheen, halation, parallax-layers.

## Coverage by category

| Category | Built | Open catalog gaps | New v2 candidates |
|---|---|---|---|
| neon-glow | 6 | 4 | 2 |
| gradient-fill | 8 | 3 | 2 |
| metallic-holographic | 11 | 3 | 1 |
| threed-depth | 8 | 5 | 4 |
| outline-stroke | 6 | 9 | 1 |
| glitch-distortion | 7 | 7 | 3 |
| retro-themed | 4 | 6 | 9 |
| shadow-press | 6 | 3 | 1 |
| elemental | 11 | 9 | 0 |
| fill-texture | 7 | 10 | 4 |
| entrance-kinetic | 23 | 19 | 9 |
| decoration-underline | 8 | 3 | 2 |
| interactive-advanced | 11 | 6 | 4 |

_Category for open gaps/candidates = suggested taxonomy placement. Fill-texture and entrance-kinetic gap counts are inflated by low-wow variants; see ranking below for what actually matters._

## Ranked open-gap list (all 129)

Sorted by wow (clamped to 5 — the catalog tail uses an inflated 6-9 scale), then difficulty (easier first), then tier priority. Raw wow shown.

| # | Idea | Source | Category | Wow | Diff | Nearest existing |
|---|---|---|---|---|---|---|
| 1 | Background-inverting text (mix-blend-mode: difference) | catalog [advanced] | fill-texture | 8 | 2 | - |
| 2 | Hue / color blend text (mix-blend-mode: hue/color/luminosity) | catalog [advanced] | fill-texture | 6 | 2 | - |
| 3 | Bungee chromatic layer stack | v2Candidates (typography-native) | threed-depth | 5 | 3 | outline-3d-extrude (built) |
| 4 | Cinema marquee bulb-chase frame | v2Candidates (canon-sweep + underweighted-styles) | retro-themed | 5 | 3 | neon-sign-frame (built) |
| 5 | Foldit origami fold morph | v2Candidates (typography-native) | entrance-kinetic | 5 | 3 | Width morph (catalog #232) |
| 6 | Honk truck-art shine morph | v2Candidates (typography-native) | retro-themed | 5 | 3 | Variable display-font showcase loop (catalog #242) |
| 7 | Nabla isometric palette cycle | v2Candidates (typography-native) | threed-depth | 5 | 3 | isometric-3d (built) |
| 8 | Draw-on (self-writing) stroke animation | catalog [advanced] | outline-stroke | 5 | 3 | glow-outline |
| 9 | Per-letter staggered flicker | catalog [advanced] | neon-glow | 5 | 3 | neon-glow |
| 10 | Plasma Energy Text (@property hue + conic) | catalog [advanced] (promoted from partial) | gradient-fill | 5 | 3 | conic-spin |
| 11 | Retro 3D headline on perspective grid | catalog [advanced] | threed-depth | 5 | 3 | retro-3d |
| 12 | Video-filled (knockout) text | catalog [advanced] | fill-texture | 5 | 3 | image-fill |
| 13 | Animated flowing gradient stroke | catalog [advanced] | outline-stroke | 5 | 4 | gradient-stroke |
| 14 | ASCII / dot-LED matrix display text | catalog [advanced] (promoted from partial) | fill-texture | 7 | 4 | halftone-dots |
| 15 | Audio / waveform reactive bar fill | catalog [advanced] | fill-texture | 7 | 4 | water-fill |
| 16 | Confetti / particle burst text | catalog [advanced] | entrance-kinetic | 7 | 4 | falling-letters |
| 17 | Cursor-repel / scatter letters on hover | catalog [advanced] | interactive-advanced | 8 | 4 | hover-ripple |
| 18 | Datamosh / pixel-smear glitch | catalog [advanced] | glitch-distortion | 5 | 4 | liquid-warp |
| 19 | Frozen Text with Hanging Icicles | catalog [advanced] | elemental | 5 | 4 | ice |
| 20 | Icy frost-creep / freeze-over fill | catalog [advanced] (promoted from partial) | elemental | 8 | 4 | ice |
| 21 | Interactive 3D tilt on hover (perspective parallax) | catalog [advanced] | threed-depth | 5 | 4 | hover-depth-3d |
| 22 | Liquid metal text (Metallic + SVG filter) | catalog [advanced] | metallic-holographic | 5 | 4 | liquid-warp |
| 23 | Magnetic / gravity attract letters on hover | catalog [advanced] | interactive-advanced | 7 | 4 | hover-ripple |
| 24 | Matrix digital rain fill | catalog [advanced] | fill-texture | 8 | 4 | terminal-phosphor |
| 25 | Odometer / slot-machine rolling digits | catalog [advanced] | entrance-kinetic | 7 | 4 | - |
| 26 | Scroll-driven gradient reveal | catalog [advanced] | gradient-fill | 8 | 4 | gradient-flow |
| 27 | Scroll-driven variable-font axis morph | catalog [advanced] | entrance-kinetic | 8 | 4 | weight-pulse |
| 28 | Text spinning around a circle (animated startOffset) | catalog [advanced] | entrance-kinetic | 8 | 4 | arc-text |
| 29 | Torn / ripped paper split text | catalog [advanced] | retro-themed | 7 | 4 | distress-stamp |
| 30 | Turbulent Flame Edges (SVG feTurbulence + feDisplacementMap) | catalog [advanced] | elemental | 5 | 4 | fire |
| 31 | Shatter shards entrance | v2Candidates (canon-sweep) | entrance-kinetic | 5 | 5 | Dissolve/disintegrate into particles (catalog #271) |
| 32 | Caustics / underwater light text | catalog [advanced] | elemental | 8 | 5 | liquid-warp |
| 33 | Dissolve / disintegrate into particles | catalog [advanced] | elemental | 9 | 5 | smoke-drift |
| 34 | Electric / plasma glow (SVG turbulence) | catalog [advanced] | neon-glow | 5 | 5 | lightning |
| 35 | Liquid wave fill with surface foam (animated SVG wave) | catalog [advanced] (promoted from partial) | elemental | 8 | 5 | water-fill |
| 36 | Neon sign self-drawing tube (animated stroke-dashoffset) | catalog [advanced] | neon-glow | 9 | 5 | glow-outline |
| 37 | Per-letter scroll-scrubbed reveal | catalog [advanced] | entrance-kinetic | 8 | 5 | stagger-reveal |
| 38 | Rotating 3D cube text | catalog [advanced] | threed-depth | 5 | 5 | flip-in-3d |
| 39 | Rough.js-style hand-sketched outline text | catalog [advanced] | outline-stroke | 7 | 5 | scribble-underline |
| 40 | Split-flap / departure board flip text | catalog [advanced] | entrance-kinetic | 8 | 5 | flip-in-3d |
| 41 | SVG bevel/emboss filter text | catalog [advanced] | shadow-press | 5 | 5 | emboss |
| 42 | Liquid glass lens / refraction text | catalog [advanced] | metallic-holographic | 9 | 6 | glass-pill |
| 43 | Liquid mercury / metaball merge text | catalog [advanced] (promoted from partial) | elemental | 9 | 6 | gooey |
| 44 | Sticker (white fill + colored stroke + hard shadow) | catalog [v1MustHave] (promoted from partial) | outline-stroke | 4 | 1 | filled-outline |
| 45 | Color-cycling glow | catalog [v1Nice] | neon-glow | 4 | 2 | neon-glow |
| 46 | Colored / rainbow stacked shadow | catalog [v1Nice] | shadow-press | 4 | 2 | long-shadow |
| 47 | Glossy candy / jelly text | catalog [v1Nice] | gradient-fill | 4 | 2 | chrome |
| 48 | Pixel / 8-bit blocky text | catalog [v1Nice] | retro-themed | 4 | 2 | - |
| 49 | Emphasis mark pop | v2Candidates (typography-native) | decoration-underline | 4 | 2 | wavy-underline (built) |
| 50 | Illuminated drop cap | v2Candidates (typography-native + interaction-pseudo) | gradient-fill | 4 | 2 | gold-foil (built) |
| 51 | Marquee ticker scroll | v2Candidates (interaction-pseudo) | entrance-kinetic | 4 | 2 | typewriter (built) |
| 52 | Neon selection styling | v2Candidates (interaction-pseudo) | interactive-advanced | 4 | 2 | neon-glow (built) |
| 53 | Prismatic dispersion fringe | v2Candidates (canon-sweep) | glitch-distortion | 4 | 2 | color-split (built) |
| 54 | Rocher chromatic bevel | v2Candidates (typography-native) | metallic-holographic | 4 | 2 | retro-3d (built) |
| 55 | Scroll neon charge-up | v2Candidates (modern-css) | neon-glow | 4 | 2 | pulse-glow (built) |
| 56 | Scroll tracking spread | v2Candidates (modern-css) | entrance-kinetic | 4 | 2 | blur-focus-in (built) |
| 57 | Knockout text via blend mode | catalog [advanced] | fill-texture | 4 | 2 | image-fill |
| 58 | Metallic gradient + 3D drop-shadow | catalog [advanced] | metallic-holographic | 4 | 2 | chrome |
| 59 | Multi-axis style morph (weight + width breathing) | catalog [advanced] | entrance-kinetic | 4 | 2 | weight-pulse |
| 60 | Art deco gold-line lettering | v2Candidates (underweighted-styles) | retro-themed | 4 | 3 | gold-foil (built) |
| 61 | Blueprint technical schematic | v2Candidates (canon-sweep + underweighted-styles) | retro-themed | 4 | 3 | outline (built) |
| 62 | Bokeh light fill | v2Candidates (canon-sweep) | fill-texture | 4 | 3 | starfield (built) |
| 63 | Clean sliced type | v2Candidates (canon-sweep) | entrance-kinetic | 4 | 3 | block-glitch (built) / Torn paper split (catalog #262) |
| 64 | CRT power collapse | v2Candidates (canon-sweep) | glitch-distortion | 4 | 3 | scanline-glitch (built) |
| 65 | Cyberpunk HUD targeting readout | v2Candidates (underweighted-styles) | retro-themed | 4 | 3 | terminal-phosphor (built) |
| 66 | Dock fisheye magnify | v2Candidates (interaction-pseudo) | interactive-advanced | 4 | 3 | hover-ripple (built) |
| 67 | Military crate safety stencil | v2Candidates (underweighted-styles) | retro-themed | 4 | 3 | distress-stamp (built) |
| 68 | Scroll glitch intensity | v2Candidates (modern-css) | glitch-distortion | 4 | 3 | glitch-rgb (built) |
| 69 | Scroll progress fill rise | v2Candidates (modern-css) | interactive-advanced | 4 | 3 | water-fill (built) |
| 70 | Scroll-scrubbed 3D flip | v2Candidates (modern-css) | threed-depth | 4 | 3 | perspective-tilt (built) |
| 71 | Sparkle glints overlay | v2Candidates (canon-sweep) | neon-glow | 4 | 3 | Confetti/particle burst (catalog #257) |
| 72 | Spiral text path | v2Candidates (interaction-pseudo) | entrance-kinetic | 4 | 3 | Circular text on a path (catalog #244) |
| 73 | Swash flourish bloom | v2Candidates (typography-native) | interactive-advanced | 4 | 3 | casual-morph (built) |
| 74 | Varsity chenille letterman patch | v2Candidates (underweighted-styles) | fill-texture | 4 | 3 | double-outline (built) |
| 75 | Woven knockout mesh | v2Candidates (modern-css) | fill-texture | 4 | 3 | stripe-fill (built) |
| 76 | Animated gradient text stroke (outline) | catalog [advanced] | outline-stroke | 4 | 3 | gradient-stroke |
| 77 | Animated wavy underline (rolling squiggle) | catalog [NO-TIER] | decoration-underline | 4 | 3 | wavy-underline |
| 78 | Balloon / inflated puffy text | catalog [advanced] | threed-depth | 4 | 3 | filled-outline |
| 79 | Box / border highlight draw-around | catalog [advanced] | interactive-advanced | 4 | 3 | neon-sign-frame |
| 80 | Digital noise glitch (static) | catalog [advanced] | glitch-distortion | 4 | 3 | scanline-glitch |
| 81 | Frosted Ice with Moving Shine | catalog [advanced] | elemental | 4 | 3 | ice |
| 82 | Marching-ants animated outline trace | catalog [advanced] | outline-stroke | 4 | 3 | outline |
| 83 | Multi-line / multi-phrase typewriter | catalog [advanced] | entrance-kinetic | 4 | 3 | typewriter |
| 84 | Ransom note | catalog [advanced] | retro-themed | 4 | 3 | zigzag-text |
| 85 | Synthwave grid-fill text (scanline) | catalog [advanced] (promoted from partial) | retro-themed | 4 | 3 | vaporwave |
| 86 | TV static / noise overlay (SVG feTurbulence) | catalog [advanced] | glitch-distortion | 4 | 3 | scanline-glitch |
| 87 | Embroidery cross-stitch thread | v2Candidates (underweighted-styles) | fill-texture | 4 | 4 | scrolling-texture (built) |
| 88 | Motion-path conveyor orbit | v2Candidates (modern-css) | entrance-kinetic | 4 | 4 | Text spinning around a circle (catalog #245) |
| 89 | Radar sweep reveal | v2Candidates (canon-sweep) | gradient-fill | 4 | 4 | conic-spin (built) |
| 90 | Scroll parallax depth stack | v2Candidates (modern-css) | threed-depth | 4 | 4 | parallax-layers (built) |
| 91 | Swoosh-in motion-path entrance | v2Candidates (modern-css) | entrance-kinetic | 4 | 4 | falling-letters (built) |
| 92 | Graffiti spray-paint text | catalog [advanced] | retro-themed | 4 | 4 | distress-stamp |
| 93 | Marble / granite material fill | catalog [advanced] | fill-texture | 4 | 4 | grain-gradient |
| 94 | Scroll/pointer-driven weight (no autoplay) | catalog [advanced] | interactive-advanced | 4 | 4 | weight-ripple-hover |
| 95 | Text corruption / scramble (CSS-only) | catalog [advanced] | glitch-distortion | 4 | 4 | decode-reveal |
| 96 | Wood-grain material fill | catalog [advanced] | fill-texture | 4 | 5 | grain-gradient |
| 97 | Breathing scale pulse | catalog [v1Nice] | entrance-kinetic | 3 | 1 | weight-wave |
| 98 | Glow-on-hover reveal | catalog [v1Nice] | interactive-advanced | 3 | 1 | hover-spotlight |
| 99 | Hue-shift / channel-corrupt glitch | catalog [v1Nice] | glitch-distortion | 3 | 1 | color-split |
| 100 | Shake / jitter | catalog [v1Nice] | entrance-kinetic | 3 | 1 | kerning-drift |
| 101 | Skew / warp distortion | catalog [v1Nice] | glitch-distortion | 3 | 1 | shake-glitch |
| 102 | Wobble rotate | catalog [v1Nice] | entrance-kinetic | 3 | 1 | jelly-wobble |
| 103 | Zoom / scale-in | catalog [v1Nice] | entrance-kinetic | 3 | 1 | bulge-text |
| 104 | Gradient mask fade | catalog [advanced] | entrance-kinetic | 3 | 1 | mask-wipe |
| 105 | Width morph (condensed to expanded) | catalog [advanced] | entrance-kinetic | 3 | 1 | mono-shift |
| 106 | Pulsing / breathing outline | catalog [v1Nice] | outline-stroke | 3 | 2 | glow-outline |
| 107 | Swap/slide-through underline (in-from-left, out-to-right) | catalog [v1Nice] | decoration-underline | 3 | 2 | slide-underline |
| 108 | Crop-mark frame | v2Candidates (interaction-pseudo) | outline-stroke | 3 | 2 | neon-sign-frame (built) |
| 109 | Die-cut corner chips | v2Candidates (modern-css) | retro-themed | 3 | 2 | glass-pill (built) |
| 110 | Follow underline glide | v2Candidates (interaction-pseudo) | decoration-underline | 3 | 2 | slide-underline (built) |
| 111 | Vertical stacked type | v2Candidates (typography-native) | entrance-kinetic | 3 | 2 | arc-text (built) |
| 112 | Windows-95 system bevel chrome | v2Candidates (underweighted-styles) | shadow-press | 3 | 2 | emboss (built) |
| 113 | Animated grade (GRAD) pulse | catalog [advanced] | entrance-kinetic | 3 | 2 | weight-pulse |
| 114 | Animated press / pulsing depth | catalog [advanced] | shadow-press | 3 | 2 | emboss |
| 115 | Dashed / dotted outline text | catalog [advanced] | outline-stroke | 3 | 2 | outline |
| 116 | Foggy Backlit Text | catalog [advanced] | elemental | 3 | 2 | smoke-drift |
| 117 | Gradient long shadow | catalog [advanced] | threed-depth | 3 | 2 | long-shadow |
| 118 | Italic morph | catalog [advanced] | entrance-kinetic | 3 | 2 | slant-wave |
| 119 | Old-monitor curvature glow (vignette barrel) | catalog [advanced] | glitch-distortion | 3 | 2 | scanline-glitch |
| 120 | Optical-size showcase morph | catalog [advanced] | entrance-kinetic | 3 | 2 | - |
| 121 | Peek slide reveal (clip-path) | catalog [advanced] | interactive-advanced | 3 | 2 | gradient-link |
| 122 | Pendulum swing | catalog [advanced] | entrance-kinetic | 3 | 2 | - |
| 123 | Spin / barrel roll | catalog [advanced] | entrance-kinetic | 3 | 2 | flip-in-3d |
| 124 | Airbrush pinstripe chrome badge | v2Candidates (underweighted-styles) | retro-themed | 3 | 3 | chrome (built) |
| 125 | Cassette futurism control panel label | v2Candidates (underweighted-styles) | retro-themed | 3 | 3 | letterpress (built) |
| 126 | Dithered / ordered-dither text fill | catalog [advanced] | fill-texture | 3 | 3 | halftone-dots |
| 127 | Western / wood saloon text | catalog [advanced] | retro-themed | 3 | 3 | grain-gradient |
| 128 | Double underline | catalog [v1Nice] | decoration-underline | 2 | 1 | - |
| 129 | Drop-shadow filter outline | catalog [v1Nice] | outline-stroke | 2 | 2 | outline |

## New v2Candidates (42) — what and why

Full technique/controls/browser-support live in catalog.json (tiers.v2Candidates). Novelty summary per entry:

### modern-css

- **Scroll-scrubbed 3D flip** (threed-depth, wow 4/diff 3, Chromium+Safari (Firefox flagged)) — nearest: _perspective-tilt (built)_. perspective-tilt is a fixed static lean and flip-in-3d is a time-based one-shot; here the tilt angle is scrubbed continuously by scroll position. [src: https://developer.chrome.com/docs/css-ui/scroll-driven-animations ; https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/]
- **Scroll parallax depth stack** (threed-depth, wow 4/diff 4, Chromium+Safari (Firefox flagged)) — nearest: _parallax-layers (built)_. parallax-layers tracks the pointer; this drives the same layered separation off the scroll offset instead. [src: https://developer.chrome.com/docs/css-ui/scroll-driven-animations ; https://www.joshwcomeau.com/animation/scroll-driven-animations/]
- **Scroll progress fill rise** (interactive-advanced, wow 4/diff 3, Chromium+Safari (Firefox flagged)) — nearest: _water-fill (built)_. water-fill ebbs on a time loop; this level is scrubbed deterministically by scroll, and catalog's scroll-driven gradient reveal is a wipe, not a rising level. [src: https://tylergaw.com/blog/css-scroll-driven-write-on/ ; https://utilitybend.com/blog/animating-clip-paths-on-scroll-with-at-property-in-css]
- **Scroll glitch intensity** (glitch-distortion, wow 4/diff 3, Chromium+Safari (Firefox flagged)) — nearest: _glitch-rgb (built)_. glitch-rgb tears on an autonomous time loop; here the tear amplitude is driven by scroll position and self-heals when centred. [src: https://developer.chrome.com/docs/css-ui/scroll-driven-animations]
- **Scroll tracking spread** (entrance-kinetic, wow 4/diff 2, Chromium+Safari (Firefox flagged)) — nearest: _blur-focus-in (built)_. blur-focus-in draws tracking together once on load; this scrubs letter-spacing bidirectionally off scroll (and unlike the catalog's scroll-driven VF morph it moves tracking, not a font axis). [src: https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/]
- **Scroll neon charge-up** (neon-glow, wow 4/diff 2, Chromium+Safari (Firefox flagged)) — nearest: _pulse-glow (built)_. pulse-glow breathes on a fixed timer; this ties glow strength to scroll depth so the sign literally charges up as the reader arrives. [src: https://developer.chrome.com/blog/scroll-triggered-animations]
- **Woven knockout mesh** (fill-texture, wow 4/diff 3, all modern) — nearest: _stripe-fill (built)_. stripe-fill paints opaque stripes onto solid glyphs; here the stripes are holes cut through the letters (crossed into a mesh via intersect) so the background reads through. [src: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-composite ; https://css-tricks.com/css-techniques-and-effects-for-knockout-text/]
- **Swoosh-in motion-path entrance** (entrance-kinetic, wow 4/diff 4, all modern) — nearest: _falling-letters (built)_. falling-letters drop straight down under gravity; these ride a curved offset-path and bank with offset-rotate, arcing into place along a swoosh. [src: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Motion_path ; https://css-irl.info/positioning-text-along-a-path-with-css/]
- **Motion-path conveyor orbit** (entrance-kinetic, wow 4/diff 4, all modern) — nearest: _Text spinning around a circle (catalog #245)_. the catalogued path-text entries use SVG textPath on a circle; this uses CSS offset-path on a non-circular looping ribbon (wave/figure-8) with per-letter banking. Adjacent family - keep only one of the two if both reach implementation. [src: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Motion_path ; https://freefrontend.com/css-motion-path-examples/]
- **Die-cut corner chips** (retro-themed, wow 3/diff 2, Chromium-only (2026)) — nearest: _glass-pill (built)_. glass-pill is a rounded frosted chip; corner-shape gives concave notch/scoop and chamfered bevel corners (ticket-stub / die-cut tabs) impossible with border-radius. [src: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape ; https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/]

### canon-sweep

- **Bokeh light fill** (fill-texture, wow 4/diff 3, all modern) — nearest: _starfield (built)_. Starfield is sharp pinpoint cosmic dots on a space gradient; bokeh is large soft defocused colored light discs with photographic bloom and lazy drift. [src: https://codepen.io/Mamboleoo/pen/BxMQYQ ; https://speckyboy.com/8-css-javascript-snippets-for-creating-beautiful-bokeh-effects/]
- **Clean sliced type** (entrance-kinetic, wow 4/diff 3, all modern) — nearest: _block-glitch (built) / Torn paper split (catalog #262)_. The glitch slice is a nervous RGB-tinged corruption tear and the torn-paper split is a jagged ragged seam; this is a single clean designed cut, sheared apart and reset. [src: https://freebiesupply.com/blog/css-text-effects-from-codepen/ ; https://prismic.io/blog/css-text-animations]
- **Shatter shards entrance** (entrance-kinetic, wow 5/diff 5, all modern) — nearest: _Dissolve/disintegrate into particles (catalog #271)_. Dissolve blurs the word into a smear of particles; this breaks it into hard geometric glass shards that tumble in 3D and lock back together. [src: https://codepen.io/ARS/pen/pjypwd ; https://codepen.io/pcameron/pen/rVmera]
- **CRT power collapse** (glitch-distortion, wow 4/diff 3, all modern) — nearest: _scanline-glitch (built)_. The scanline effects add a static CRT texture over legible text; this is the signature geometric power-off/on where the whole word collapses to a bright line and snaps back. [src: https://codepen.io/francescostella/pen/ONaWvZ]
- **Sparkle glints overlay** (neon-glow, wow 4/diff 3, all modern) — nearest: _Confetti/particle burst (catalog #257)_. Confetti is a one-shot outward burst and starfield is a static dot field; this is a small set of big cross-flared star glints that twinkle in place indefinitely. [src: https://www.techumber.com/amazing-glitter-star-effect-using-pure-css3 ; https://codepen.io/kucsatax/pen/vyWevX]
- **Prismatic dispersion fringe** (glitch-distortion, wow 4/diff 2, all modern) — nearest: _color-split (built)_. Color-split is two spot-color offset copies around a neutral core; this is a continuous multi-hue spectral gradient fringe (a prism dispersion), not a two-tone print aberration. [src: https://expensive.toys/blog/css-rgb-split-effect]
- **Radar sweep reveal** (gradient-fill, wow 4/diff 4, all modern) — nearest: _conic-spin (built)_. Conic-spin fills the glyphs with a full spinning color wheel; this is a single narrow beam with a fading trail scanning an otherwise-dim word - a radar reveal, not a fill. [src: https://csswolf.com/radar-scanner-animation-effect-in-css-no-js/]

### canon-sweep + underweighted-styles

- **Cinema marquee bulb-chase frame** (retro-themed, wow 5/diff 3, all modern) — nearest: _neon-sign-frame (built)_. neon-sign-frame is a continuous glowing tube that breathes as one halo; this is a string of discrete warm incandescent bulbs chasing around the frame in steps - theater-marquee sign language, not a neon tube. (Independently proposed by two research lenses.) [src: https://codepen.io/nickpettit/pen/kvpWKo ; https://www.instructables.com/Chasing-Lights-Marquee-Sign/]
- **Blueprint technical schematic** (retro-themed, wow 4/diff 3, all modern) — nearest: _outline (built)_. outline is a bare editorial hairline stroke; this wraps the same stroke in a full engineering-drawing context - grid ground, registration crosshairs, annotated dimension line. (Independently proposed by two research lenses.) [src: https://tympanus.net/codrops/tag/typography/ ; https://vayce.app/tools/color-palette-generator/blueprint-blue/]

### typography-native

- **Nabla isometric palette cycle** (threed-depth, wow 5/diff 3, all modern (static render); palette animation Chromium-only) — nearest: _isometric-3d (built)_. Nabla's isometric extrusion and gradient are real vector color-font paint layers, not a CSS text-shadow slab stack. [src: https://css-tricks.com/colrv1-and-css-font-palette-web-typography/ ; https://developer.chrome.com/blog/colrv1-fonts]
- **Foldit origami fold morph** (entrance-kinetic, wow 5/diff 3, all modern) — nearest: _Width morph (catalog #232)_. Morphs a dimensional gradient-shaded paper-strip color glyph that physically folds, not a plain sans condensing/expanding on the width axis. [src: https://fonts.google.com/specimen/Foldit ; https://github.com/SophiaDesign/Foldit]
- **Honk truck-art shine morph** (retro-themed, wow 5/diff 3, all modern) — nearest: _Variable display-font showcase loop (catalog #242)_. Drives a color truck-art font's bespoke MORF/SHLN axes to sweep an embedded shine line, not a generic weight/width loop on a sans. [src: https://fonts.google.com/specimen/Honk ; https://github.com/EkType/Honk]
- **Rocher chromatic bevel** (metallic-holographic, wow 4/diff 2, all modern) — nearest: _retro-3d (built)_. The multi-color glossy bevel is baked into the vector font's paint layers, giving candy depth a two-tone CSS offset slab can't match. [src: https://css-tricks.com/colrv1-and-css-font-palette-web-typography/]
- **Bungee chromatic layer stack** (threed-depth, wow 5/diff 3, all modern) — nearest: _outline-3d-extrude (built)_. Depth and the inner highlight groove are drawn by Bungee's dedicated Inline/Shade layer fonts, keeping crisp signage edges no offset text-shadow can produce. [src: https://github.com/djrrb/Bungee/blob/master/documentation/2-chromatic-layers.md ; https://djr.com/bungee]
- **Emphasis mark pop** (decoration-underline, wow 4/diff 2, all modern) — nearest: _wavy-underline (built)_. Native East-Asian emphasis marks sit ABOVE each individual glyph and pop in per-letter - every existing decoration effect sits below the text. [src: https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis ; https://css-tricks.com/almanac/properties/t/text-emphasis/]
- **Vertical stacked type** (entrance-kinetic, wow 3/diff 2, all modern) — nearest: _arc-text (built)_. Sets type on an orthogonal vertical writing axis with upright glyphs (book-spine/poster), not a curved or tilted horizontal baseline. [src: https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode ; https://24ways.org/2016/css-writing-modes/]
- **Swash flourish bloom** (interactive-advanced, wow 4/diff 3, all modern) — nearest: _casual-morph (built)_. Real OpenType swash/stylistic-set glyph substitution grows ornamental tails, not a variable-axis interpolation of one sans glyph. [src: https://css-tricks.com/almanac/properties/f/font-feature-settings/ ; https://css-tricks.com/almanac/properties/f/font-variant-alternates/]

### typography-native + interaction-pseudo

- **Illuminated drop cap** (gradient-fill, wow 4/diff 2, all modern (initial-letter Chromium+Safari; float fallback elsewhere)) — nearest: _gold-foil (built)_. A structural manuscript versal - only the first letter is enlarged and illuminated while the rest reads plain - not a whole-word fill. (Independently proposed by two research lenses.) [src: https://css-tricks.com/getting-creative-with-versal-letters/ ; https://developer.chrome.com/blog/control-your-drop-caps-with-css-initial-letter]

### underweighted-styles

- **Art deco gold-line lettering** (retro-themed, wow 4/diff 3, all modern) — nearest: _gold-foil (built)_. gold-foil is only a metallic gradient fill; this adds the Deco-period geometric ornament system (flanking rules, diamond ticks, radiating sunburst) that reads as period graphic design. [src: https://codepen.io/mandymichael/pen/xpLNeV ; https://texteffects.dev/posts/gold-text-effect]
- **Embroidery cross-stitch thread** (fill-texture, wow 4/diff 4, all modern (mask-composite needs a recent Firefox)) — nearest: _scrolling-texture (built)_. Scrolling Weave clips a moving cloth pattern into the glyphs; embroidery builds directional satin-stitch ridges plus a dashed running-stitch ring around each letter, reading as sewn thread. [src: https://codepen.io/Dillo/pen/VYjVzXr ; https://www.hongkiat.com/blog/css-stitched-effect/]
- **Varsity chenille letterman patch** (fill-texture, wow 4/diff 3, all modern) — nearest: _double-outline (built)_. double-outline is two flat concentric rings around a hollow center; this fills the glyph with fuzzy chenille fiber texture and stacks three rings plus a sewn-patch shadow - an embroidered letterman patch. [src: https://www.ym-graphix.com/blog/best-varsity-fonts/ ; https://design.tutsplus.com/tutorials/how-to-create-a-varsity-lettering-effect-in-adobe-illustrator--cms-21923]
- **Windows-95 system bevel chrome** (shadow-press, wow 3/diff 2, all modern) — nearest: _emboss (built)_. emboss is a soft theme-adaptive continuous relief; this uses hard 0-blur 1px pixel offsets plus an explicit gray outset button-chip border - literal retro-OS bevel chrome. [src: https://github.com/YoshiMannaert/95CSS ; https://news.ycombinator.com/item?id=22940564]
- **Cyberpunk HUD targeting readout** (retro-themed, wow 4/diff 3, all modern) — nearest: _terminal-phosphor (built)_. terminal-phosphor is glow plus flicker applied to the glyphs themselves; this frames the word in targeting-bracket HUD chrome with a moving radar scan-line and tick readout - a UI overlay device, not a screen-phosphor treatment. [src: https://ahmodmusa.com/create-cyberpunk-glitch-effect-css-tutorial/ ; https://dev.to/sebyx07/introducing-cybercore-css-a-cyberpunk-design-framework-for-futuristic-uis-2e6c]
- **Cassette futurism control panel label** (retro-themed, wow 3/diff 3, all modern) — nearest: _letterpress (built)_. letterpress is a subtle theme-matched paper deboss on plain text; this composes a full riveted plastic control-panel placard (bevel groove, corner rivets, safety-orange chip) around debossed label-tape lettering. [src: https://andrewsuniverse.com/post/ui-inspiration-cassette-futurism ; https://github.com/Imetomi/retro-futuristic-ui-design]
- **Military crate safety stencil** (retro-themed, wow 4/diff 3, all modern) — nearest: _distress-stamp (built)_. distress-stamp roughens edges and punches random noise holes via SVG turbulence for a worn look; this cuts clean geometric horizontal bridge gaps (the literal way stencils are cut) and adds a hazard-stripe crate frame. [src: https://design.tutsplus.com/tutorials/how-to-create-a-military-stencil-text-effect-in-illustrator--cms-36761 ; https://www.geeksforgeeks.org/css-stencil-effect/]
- **Airbrush pinstripe chrome badge** (retro-themed, wow 3/diff 3, all modern) — nearest: _chrome (built)_. chrome is a crisp vertical metallic bevel gradient; this softens the fill edges into feathered airbrush spray and adds an offset pinstripe decal line behind the slanted word - the 90s moto/skate badge treatment. [src: https://www.coolandcollected.com/airbrush-art-of-the-80s-was-chrome-tastic/]

### interaction-pseudo

- **Neon selection styling** (interactive-advanced, wow 4/diff 2, Chromium+Safari) — nearest: _neon-glow (built)_. The neon halo is dormant until the user drag-selects the text and is delivered through the ::selection pseudo-element, a mechanism no existing effect touches. [src: https://developer.mozilla.org/en-US/docs/Web/CSS/::selection ; https://css-tricks.com/almanac/selectors/s/selection/]
- **Dock fisheye magnify** (interactive-advanced, wow 4/diff 3, all modern) — nearest: _hover-ripple (built)_. Scaling is keyed to which specific letter is under the cursor with a spatial proximity falloff (dock fisheye), not a time-delayed wave that runs uniformly across the word. [src: https://www.smashingmagazine.com/2023/01/level-up-css-skills-has-selector/ ; https://frontendmasters.com/blog/selecting-previous-siblings/]
- **Marquee ticker scroll** (entrance-kinetic, wow 4/diff 2, all modern) — nearest: _typewriter (built)_. A seamless horizontally-scrolling ticker with duplicated track and edge-fade mask - continuous lateral motion; no marquee exists anywhere in either list. [src: https://medium.com/design-bootcamp/infinite-marquee-animation-using-modern-css-0d11d11fcc10 ; https://www.webbae.net/posts/you-cant-find-a-better-infinite-marquee]
- **Spiral text path** (entrance-kinetic, wow 4/diff 3, all modern) — nearest: _Circular text on a path (catalog #244)_. A multi-loop spiral winding inward toward the center is a different path geometry than a single closed-circle ring; adjacent family - prefer whichever ships better. [src: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/textPath ; https://css-tricks.com/snippets/svg/curved-text-along-path/]
- **Crop-mark frame** (outline-stroke, wow 3/diff 2, all modern) — nearest: _neon-sign-frame (built)_. Discrete corner crop-marks/brackets read as print registration marks, not a continuous glowing box. [src: https://css-tricks.com/7-practical-uses-for-the-before-and-after-pseudo-elements/]
- **Follow underline glide** (decoration-underline, wow 3/diff 2, all modern) — nearest: _slide-underline (built)_. The underline is letter-scoped and slides to whichever glyph is hovered via :has()/sibling selectors, versus a single word-wide bar that grows once from the left. [src: https://frontendmasters.com/blog/selecting-previous-siblings/]

## Promoted partial matches (7)

These catalog entries were matched as partial (counted covered) by reconciliation, but re-adjudication found the visual delta big enough to keep them as open gaps:

- **Sticker (white fill + colored stroke + hard shadow)** (partial vs built filled-outline): Hard offset shadow + die-cut chip padding make the sticker a distinct, hugely popular style that filled-outline alone does not deliver.
- **Synthwave grid-fill text (scanline)** (partial vs built vaporwave): A perspective grid/scanline texture inside the letters reads clearly different from vaporwave's plain gradient-plus-glow.
- **Plasma Energy Text (@property hue + conic)** (partial vs built conic-spin): Hue-cycling plus a blurred energy glow reads as plasma energy, not conic-spin's clean color wheel.
- **ASCII / dot-LED matrix display text** (partial vs built halftone-dots): A monochrome LED-scoreboard dot matrix (optionally marquee-scrolling) is visually distinct from the pop-art halftone dots.
- **Icy frost-creep / freeze-over fill** (partial vs built ice): An animated edge-inward freeze-over is a transition effect; built ice is a static crystalline fill.
- **Liquid mercury / metaball merge text** (partial vs built gooey): A reflective metallic metaball merge is a showpiece well beyond gooey's flat-color goo filter.
- **Liquid wave fill with surface foam (animated SVG wave)** (partial vs built water-fill): A true animated wave crest with surface foam reads differently from water-fill's flat rising waterline.

## Rejected candidates (9 of 51 proposed)

- **Illuminated Versal** (interaction-pseudo) — merged: same concept independently proposed by the typography lens; shipped once as 'Illuminated drop cap'.
- **Marquee Bulb Sign** (canon-sweep) — merged: same concept as the underweighted-styles lens's marquee; shipped once as 'Cinema marquee bulb-chase frame'.
- **Blueprint Draft** (canon-sweep) — merged: same concept as the underweighted-styles lens's blueprint; shipped once as 'Blueprint technical schematic'.
- **Part the Letters** (interaction-pseudo) — REJECTED: concept-duplicate of catalog #277 'Cursor-repel / scatter letters on hover'. Letters moving away from the cursor's vicinity is the same visual; :has() vs pointer-vars is an implementation detail.
- **Letter Focus** (interaction-pseudo) — REJECTED: near-duplicate of built focus-lens (blur everything, sharpen a focal point). Discrete per-letter snap vs continuous disc is too thin a delta.
- **Editorial Index** (interaction-pseudo) — REJECTED: decorates around the headline with a counter numeral; does not transform the text itself — off-mission for a text-effects generator.
- **Backdrop Frost Lens** (modern-css) — REJECTED: duplicate of catalog #259 'Liquid glass lens / refraction text' (backdrop-filter refraction through glyph shapes); frost-blur is a parameter of the same concept.
- **Anamorphic Lens Flare** (canon-sweep) — REJECTED: the light-sweep-across-text family is the most duplicated concept in the catalog (a 6-entry dup cluster already maps to built shine-sweep); a 7th variant fails the no-repeats bar.
- **Y2K Aqua Gloss Bubble Text** (underweighted-styles) — REJECTED: duplicate of catalog #100 'Glossy candy / jelly text' (saturated glossy fill + specular highlight); the aqua palette and puddle shadow are variant parameters.

## Catalog-internal duplicate clusters (31)

Groups of original-catalog entries that describe essentially the same visual concept (union of the three reconcilers' findings). When picking from the backlog, treat each cluster as ONE idea:

- [26, 65, 72, 73, 140, 204, 212, 226] Gradient shimmer / metallic sheen sweep / Shimmer light-sweep across text / Foil with animated highlight bar / Flowing metallic gradient / Animated gradient shimmer fill / Shine sweep shimmer / Glow trail light streak / Scan sweep (light bar across text)
- [74, 166, 222, 223, 260] RGB / chromatic split glitch / RGB split glitch-in / RGB split glitch (pseudo-element clip) / RGB split / chromatic aberration (SVG filter, single element) / Glitch datamosh slice-scroll (RGB layer scroll)
- [183, 184, 185, 186, 187] Slide-in underline (left-to-right gradient grow) / Center-out underline (expand from middle) / Swap/slide-through underline (in-from-left, out-to-right) / Grow-to-fill highlight underline (slide-to-top) / Draw-on underline (scaleX pseudo-element)
- [27, 60, 61, 62] Metallic chrome / gold gradient / Chrome / silver gradient text / Gold gradient text (classic foil) / Rose-gold / copper gradient text
- [3, 14, 88, 213] Broken neon flicker / Buzzing low-power flicker (opacity) / Glow / bloom flicker glitch / Neon flicker glow
- [19, 168, 179, 180] Per-letter rainbow wave / Sine wave float / Per-letter hue cycle / Rainbow wave (motion + color)
- [67, 69, 221, 250] Iridescent / holographic foil text / Animated hue-spin metallic (@property) / Hologram flicker (iridescent shimmer) / Soap-bubble / thin-film iridescent text
- [24, 52, 53] Animated gradient text stroke (outline) / Gradient stroke (gradient-colored outline) / Animated flowing gradient stroke
- [8, 9, 21] Gradient glow text / Animated gradient + glow shimmer / Gradient + glow combo (neon pulse)
- [148, 159, 210] Mask wipe reveal / Mask wipe reveal (gradient mask slide) / Wipe reveal (animated gradient mask)
- [165, 169, 177] Dropping / falling letters / Cascading letter bounce / Squash & stretch bounce
- [120, 121, 122] Flickering Fire Text (layered text-shadow) / Gradient Fire Fill with Glow / Turbulent Flame Edges (SVG feTurbulence + feDisplacementMap)
- [133, 269, 272] Gooey Blob Morph Text / Liquid drip + stretch goo (SVG gooey filter) / Liquid mercury / metaball merge text
- [193, 194, 197] Highlighter marker sweep / Pen / felt-tip highlight (uneven hand-drawn marker) / Background highlight reveal (scroll/hover wipe behind text)
- [2, 13] Pulsing / breathing glow / Layered halo glow (@property animated)
- [5, 55] Neon outline (transparent fill + glowing stroke) / Neon outline tube
- [29, 30] 3D extrude (stacked text-shadow) / 3D text tower (stacked DOM elements)
- [56, 127] Partial-fill outline (liquid/level fill) / Water-Fill Rising Wave Text
- [129, 130] Melting / Dripping Goo Text / Clip-Path Drip Text
- [89, 102] Vaporwave/synthwave gradient title / Synthwave grid-fill text (scanline)
- [162, 182] Character-by-character stagger reveal / Typewriter letter cascade
- [170, 171] Jelly / elastic wobble / Rubber-band stretch
- [173, 174] Wobble rotate / Pendulum swing
- [155, 156] Simple fade-in / Slide-in (directional fade-up/left)
- [143, 144] Polka-dot / grid pattern fill / Halftone fill
- [175, 176] 3D card flip / Spin / barrel roll
- [23, 208] Duotone two-color gradient / Color-split half/half (hard-stop gradient)
- [198, 199] Webkit box-reflect mirror / Cloned mirror reflection (gradient-masked)
- [18, 206] Animated conic gradient spin / Conic glow halo sweep
- [219, 220] Terminal / matrix green phosphor glow / Phosphor flicker (terminal power-on flicker)
- [119, 263] SVG bevel/emboss filter text / Embossed metallic plate (metal + bevel + specular)

## Built effects with no catalog row (18)

marching-underline, scribble-underline, heat-haze, ink-bleed, bulge-text, casual-morph, fan-text, kerning-drift, slope-text, zigzag-text, soft-duotone, spotlight, focus-lens, glare-sweep, glass-pill, sheen, halation, parallax-layers

These are house originals that grew beyond the research catalog — no action needed; documented so nobody assumes the catalog is a superset of the app.

## Pre-existing catalog issues (found & handled)

- **Tier drift (FIXED in this change)**: tiers listed 'Shine sweep shimmer (Shine)' and 'Wavy underline (rolling squiggle)' which matched no effect name; corrected to 'Shimmer light-sweep across text' and 'Animated wavy underline (rolling squiggle)'. The four tiers now exactly partition all 322 entries.
- **#273 'Audio / waveform reactive bar fill' is mislabeled, not infeasible**: its own technique describes a visual-only looping equalizer-bar fill with no audio API. Keep it, but rename when implementing.
- **#139 'Video-filled (knockout) text' needs a video asset** — the only entry that genuinely cannot ship under the zero-asset engine contract as written; a gradient-animation stand-in would collapse into existing fills.
- **#181 'Kinetic scramble reveal'**: true random character-cycling needs JS; the catalog itself concedes only a flicker-in approximation is possible (which built decode-reveal already delivers).
- **Inflated wow scale in the tail**: entries ~244-279 use wow 6-9 vs the 1-5 scale used elsewhere. Rankings in this report clamp to 5. New v2Candidates use the 1-5 scale.

## Suggested next moves

1. **Ship the scroll lane** (6 v2 + catalog #252/253/254): one engineering investment (scroll-timeline plumbing in Stage/exports mirrors the existing pointer runtime) unlocks 9 effects and a marketing story no competitor tool has.
2. **Fatten retro-themed** with the style-family candidates (marquee bulbs, art deco, stencil, HUD, blueprint, Win-95) — all pure-CSS, no new engine capability needed.
3. **Prototype one COLRv1 effect** (Nabla or Honk) to validate the font-loading path; if it works, three more follow nearly free.
4. Mine the top of the ranked table for v1MustHave/v1Nice leftovers — 'Per-letter staggered flicker', 'Color-cycling glow', 'Sticker', 'Draw-on stroke animation' are high-wow, low-difficulty, and conspicuously absent.

## Implemented 2026-07 batch (80 effects; library 116 → 196)

All wow ≥ 4, family-deduped, feasible open ideas were implemented in one multi-agent
batch (Opus/Sonnet workers, wave-gated with per-effect contract tests + screenshot QA).

**Shipped (by wave):**
- Pilots: scroll-charge, nabla-iso
- W1: letter-flicker, color-cycle-glow, sparkle-glints, sticker, pixel-8bit, marquee-bulbs,
  blueprint, art-deco, hud-targeting, safety-stencil, crt-collapse, candy-gloss, bokeh-fill
- W2: drop-cap, balloon-puff, rainbow-stack, prism-fringe, sliced-type, ticker-scroll,
  rolling-squiggle, emphasis-pop, border-draw, neon-selection, knockout-panel, blend-invert,
  woven-mesh
- W3: flame-edges, icicles, frost-creep, wave-crest, equalizer-bars, marble-fill, wood-grain,
  matrix-rain, led-matrix, tv-static, datamosh-smear
- W4: graffiti-spray, torn-paper, ransom-note, varsity-patch, embroidery-stitch,
  flowing-stroke, marching-ants, sketch-outline, plasma-energy, radar-sweep, synthwave-grid
- W5: neon-tube-draw, mercury-metaball, particle-dissolve, caustics, liquid-lens, shatter-in,
  split-flap, odometer-roll, confetti-burst, bevel-plate
- W6: swoosh-in, spiral-text, circle-spin, cube-spin, pointer-tilt, cursor-repel,
  dock-magnify, weight-scrub, swash-bloom
- Scroll lane: scroll-glitch, scroll-fill, scroll-flip, scroll-parallax, scroll-spread,
  scroll-morph, scroll-letters, scroll-reveal
- Font lane: foldit-fold, honk-shine, bungee-layers

**Excluded with reasons (dedupe/feasibility ledger):** video-filled text (needs a video
asset — zero-asset contract), CSS scramble + multi-phrase typewriter (need JS / don't fit
the single-headline text model), draw-on stroke ⊂ neon-tube-draw, liquid-metal ≡
mercury-metaball, digital-noise ≡ tv-static, frosted-ice-shine / metallic+3D-shadow /
synthwave-grid-fill ≡ composables of shipped effects, hue-blend ≡ blend-invert family,
magnetic-attract ≡ cursor-repel family (inverse), motion-path conveyor ≡ circle-spin family,
multi-axis VF morph ≡ casual-morph, Rocher Color (not on Google Fonts — hosting burden),
plus all wow ≤ 3 variants (see ranked table above; still open for a future filler batch).

The remaining open ideas in the ranked table (wow ≤ 3 + the excluded families) stay in
tiers.v2Candidates / this report for future rounds.
