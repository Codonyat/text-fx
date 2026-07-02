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
  "neon-sign-frame":
    "Glowing text inside a glowing rounded border box — outer and inset halos that breathe on a loop. A complete neon storefront sign.",
  halation:
    "The warm photographic bloom film type picks up — a soft red-orange halation fringe haloing the letters from layered text-shadows. Cinematic, not neon, and stays still.",
  "scroll-charge":
    "Layered text-shadows whose blur radii and hot-white core ramp from a near-dead unlit tube to a fully-lit sign as the text travels the scrollport, with a real neon ignition stutter as it strikes. Scroll-scrubbed via animation-timeline: view() — browsers without scroll timelines simply show the finished, fully-lit state.",
  "color-cycle-glow":
    "A neon tube whose hue travels the full color wheel forever, driven by a salted @property number the browser interpolates every frame. The letter fill and its halo both read the same live hue, so the glow morphs cyan to magenta to amber in one continuous, GPU-smooth loop.",
  "letter-flicker":
    "A worn neon sign where every tube blinks on its own clock: per-letter delays and duration buckets keep the flicker desynced instead of pulsing as one word. One letter, picked from the text itself, reads as the dying tube — it stutters harder and holds a long dark dwell while the rest of the sign keeps glowing steady.",
  "sparkle-glints":
    "Four-point star glints — crossed gradient rays around a white-hot core, screen-blended so they read as pure light — wink in and out at staggered spots across the word, timed so two or three are always sparkling. The letters keep a bright polished-metal fill, like diamond twinkle on jewelry lettering rather than a sweep or a texture.",
  "neon-tube-draw":
    "A neon sign that writes itself: the word is an inline SVG whose coloured stroke — the glass tube — draws on by animating stroke-dashoffset while a layered drop-shadow halo brightens to full glow. Once lit it holds with a faint buzz, powers down in a broken-sign flicker, then silently resets and redraws on an endless loop.",
  // gradient-fill
  "gradient-flow":
    "A multi-stop gradient clipped to the text that slowly flows by animating its background position. The go-to lively gradient headline.",
  "conic-spin":
    "A conic gradient clipped to the letters that rotates forever using an animated @property angle. A modern, hypnotic color wheel through your text.",
  "duotone-fill":
    "A crisp two-color split gradient filling the glyphs via background-clip. Bold, poster-like, and endlessly recolorable by hue.",
  "mesh-gradient":
    "Four soft color blobs blended into a smooth mesh and clipped to the glyphs, with an optional slow drift. A modern, multi-directional gradient fill.",
  "gradient-glow":
    "A flowing multi-stop gradient clipped to the text and lit from behind by a matching drop-shadow bloom. A gradient headline that radiates.",
  "gradient-follow":
    "A multi-hue radial gradient fills the glyphs from a focal point that tracks your cursor, so the color wheel slides under the text as you move.",
  "spotlight":
    "A near-white heading lit by a soft off-center gradient — almost monochrome, just a whisper of hue. The restrained way premium product sites treat hero type.",
  "soft-duotone":
    "A refined two-tone gradient in close, muted hues — the editorial gradient on modern headings, not a bold poster split. Low saturation keeps it tasteful.",
  "candy-gloss":
    "A wet hard-candy shell: a saturated vertical gradient clipped to the glyphs from bright sugary top to deep juicy base, topped with a soft white specular band across the upper third. A thin darker stroke contains the shine and a tight lift shadow gives it body — sweet and glossy, never metallic.",
  "drop-cap":
    "Only the first letter gets the manuscript treatment: an enlarged ::first-letter with a rich diagonal gradient fill, a thin contrast rim, and a soft drop-shadow, while the rest of the word stays plain and quiet. An optional tinted frame sits behind the cap for a fuller illuminated-initial feel.",
  "radar-sweep":
    "A dim, still-legible word sits behind a single bright conic beam that spins around its centre using an animated @property angle, lighting each letter as the sweep passes and leaving a decaying afterglow trail. Radar-green by default with amber and blue phosphor variants plus optional faint concentric scope rings — a sonar scanner clipped to your text.",
  "plasma-energy":
    "The word as contained ball-lightning: a conic gradient clipped to the glyphs spins on an animated @property angle while a second @property cycles every hue at once, so the swirl never settles into a tidy colour wheel. A white-hot core and a breathing magenta-to-cyan drop-shadow glow make it read as humming, ionised energy.",
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
  "glare-sweep":
    "A polished metal fill with a bright specular highlight that slides to wherever your cursor is, like light catching a chrome plaque.",
  "holo-pointer":
    "An iridescent foil whose hue bands tilt and shimmer as you move the cursor, which repositions the oversized gradient. Pointer-reactive holographic.",
  "sheen":
    "A soft silver heading with a slow specular highlight gliding across now and then — the understated glint premium brands use on a wordmark.",
  "glass-pill":
    "The word set in a frosted glassmorphism chip: a translucent panel with a hairline border, inset highlight and backdrop blur. The modern changelog-badge treatment.",
  "liquid-lens":
    "The glyphs become clear liquid-glass lenses that refract whatever sits behind them — an SVG clipPath of the word clips a backdrop-filtered layer, so the stage blurs and saturates through the letterforms. A specular top edge, a dark bottom edge for lens thickness, a faint rim stroke and a slow sheen sweep sell the glass, while a tint control guarantees visible body even on flat backdrops.",
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
  "parallax-layers":
    "Two shaded copies trail the cursor at increasing rates behind the face, so deeper layers slide further — stacked 3D depth that follows the pointer.",
  "nabla-iso":
    "Nabla's real COLRv1 glyphs — isometric 3D blocks whose extrusion, highlights and shadows are baked into the font's own paint layers — recolored by two custom palettes that endlessly cross-fade between your hues. A genuine color-font depth effect, not a text-shadow fake.",
  "balloon-puff":
    "Each letter is filled with an off-center radial gradient — a bright specular spot near the upper-left curving through a saturated hue down to a deep latex edge — for the unmistakable sheen of an inflated party balloon. A soft two-layer shadow floats well below each glyph for lift, while a gentle per-letter scale breathe, staggered by index, keeps the whole word subtly alive.",
  "synthwave-grid":
    "The full 80s album-cover scene: chrome-to-sunset lettering split by a bright horizon line leans back on its own perspective, standing on a neon grid floor that scrolls forever toward a glowing sun. Pure CSS — two repeating-gradient planes under a rotateX perspective, driving into the sunset.",
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
  "sticker":
    "Die-cut vinyl sticker lettering: a bright solid fill wrapped in a thick contrasting border, like the white edge left behind by a sticker cutter. A hard, zero-blur offset shadow drops it onto the page for a real peel-and-stick feel.",
  "sketch-outline":
    "Hollow pen-drawn letterforms pushed through a gentle SVG turbulence displacement so every stroke wavers like a hand-drawn line, doubled by a fainter, differently-wobbled second pass for that gone-over-twice sketchbook feel. Choose graphite, ink-black or ballpoint-blue and flip on faint diagonal hatching inside the glyphs; it reads on the dark stage or the paper-white theme.",
  "marching-ants":
    "The selection-marquee classic wrapped around your letters: a hollow text-stroke outline chopped into crisp diagonal dashes by a repeating-gradient mask, whose position animates so the dashes crawl forever like marching ants. Monochrome white-on-dark / black-on-light by default with an optional hue tint and a translucent inner fill so the hollow glyph reads intentional.",
  "flowing-stroke":
    "Hollow letters whose outline itself comes alive: a multi-hue conic gradient is clipped to the text and rotated forever through a transparent stroke, so a neon current circulates continuously around the glyph edges. Unlike a static gradient stroke, the colour never stops moving — a duo-hue-to-rainbow band flows around the letterforms while a page-matching fill keeps the centres clean.",
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
  "crt-collapse":
    "An old CRT tube snapping on: the word pinches to a blinding horizontal line, flickers, then punches open with a fast vertical overshoot before settling into crisp, phosphor-tinted text. A one-shot power-on entrance — hover to trigger it again.",
  "prism-fringe":
    "Eight hue-stepped text-shadow layers fan out along one axis from red through violet, with the outermost violet layer travelling furthest — just like real dispersion, where shorter wavelengths bend more. A slow ease-in-out breathe slides the whole spectrum out and back in while the glyph fill stays a crisp, neutral face.",
  "datamosh-smear":
    "An SVG displacement filter fed by anisotropic noise drags whole horizontal strips of the glyphs sideways like broken video macroblocks, with a hue-skewed tinted ghost surfacing on top. Stepped SMIL timing detonates a violent compression-artifact burst early in every loop, then snaps clean for a long pristine stretch before a late micro-burst hits.",
  "tv-static":
    "An SVG feTurbulence noise, hard-thresholded to pure black-and-white speckle and composited only inside the letters, so the word reads like a dead channel wearing its own silhouette. A stepped seed animation crawls the snow frame-to-frame, with an optional rolling sync bar, a faint cool tint and a subtle brightness flicker.",
  // retro-themed
  vaporwave:
    "A pink-to-cyan gradient title with a soft, dreamy glow. The signature 80s/synthwave aesthetic in pure CSS.",
  "distress-stamp":
    "A solid ink run through an SVG filter that roughens the edges and punches noise holes, for a worn rubber-stamp look. Grungy and tunable.",
  "chalkboard":
    "Chalk-dust lettering with edges roughened by an SVG turbulence displacement and a faint dusty halo. White chalk on dark, charcoal on light.",
  "riso-misregister":
    "Risograph print drift: the word in two spot inks that don't quite align, the offset copy blended over the base so the misregistered fringes and a third overlap tone show. Static.",
  "pixel-8bit":
    "Silkscreen's true bitmap glyphs get a hard, zero-blur offset shadow stacked in two darker tones for a chunky NES-title-screen slab — no blur anywhere, just clean pixel-grid steps. Four arcade palette-swaps (NES gray/red, Game Boy green, arcade cyan/magenta, insert-coin gold) plus an optional stepped blink dial in the retro-console feel.",
  "blueprint":
    "Hollow hairline-stroked letterforms sit as line-art on a deep cyanotype-blue drawing sheet, complete with a faint graph-paper grid, corner registration marks, and a dashed dimension line under the baseline. On a light stage the process inverts to navy ink on pale drafting paper, echoing the classic diazo whiteprint.",
  "safety-stencil":
    "Bold flat spray ink with literal die-cut bridge gaps — thin transparent bands masked straight through every glyph, exactly the bridges a real letter stencil needs to hold its shape together. Wrap it in the yellow-and-black hazard-stripe frame for the full military-crate warning-label look, crisp and geometric with zero grunge.",
  "hud-targeting":
    "Four L-shaped corner brackets lock onto the word like a fighter-jet targeting reticle, while a bright scan-line sweeps down through the glyphs on a loop and a dashed data-readout strip ticks along under the baseline. A steady cyan/green glow holds the text itself rock-solid — this is HUD chrome built around the word, not a flicker on the letters.",
  "marquee-bulbs":
    "A pair of incandescent bulb strips run above and below the lettering, every other socket popping bright in a hard, discrete jump — the real Broadway chase, built from tiled radial-gradient dots and steps() rather than a smooth slide. The gold-gradient lettering gets its own soft bevel via a drop-shadow stack, and an optional boxed cabinet turns the strips into an enclosed marquee sign.",
  "art-deco":
    "A 1920s Gatsby poster treatment: a flat, graphic gold gradient clipped to the letters, framed by thin flanking rules that taper into diamond terminals, with a faint sunburst medallion glowing behind the whole word. Slide the hue from rose through gold to silver, tune the rule weight, and toggle the sunburst for period geometry with luxurious restraint.",
  "graffiti-spray":
    "Street-art spray-paint: a vivid saturated fill wrapped in a thick contrasting keyline, its edges frayed by a subtle SVG turbulence displacement so they read like aerosol on a wall. A blurred second-colour copy mists a soft overspray halo around the letters, with optional wet paint drips running off their bottoms.",
  "ransom-note":
    "Each letter is a paper scrap cut from a different magazine — its own typeface, paper color and ink, tacked down at a slight angle with a hard rim and a little drop shadow. Deterministic per-letter buckets mix the fonts and a rotating paper palette (classic newsprint, neon zine, or kidnapper chic) so no two neighbors match.",
  "torn-paper":
    "The word ripped in half like a paper scrap: two paper-white copies are clipped to the top and bottom of a single irregular, deterministically-jagged tear seam, then nudged a few pixels apart and rotated in opposite directions. A brighter fiber backing peeks through the rip to catch light while a soft shadow underneath adds depth, with a warm, adjustable paper tint.",
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
  "engrave":
    "Letters carved into the surface — a low-contrast fill with a shadow on top and a highlight below (the inverse of emboss). Debossed and tactile.",
  "rainbow-stack":
    "A staircase of hard, zero-blur shadow steps marches behind the neutral face, and every step gets its own distinct hue walking the color wheel — full rainbow spread or a tight analogous walk from your chosen start hue. The retro-poster spectral trail, tunable by step count, march angle, hue span, and starting hue.",
  "bevel-plate":
    "Real SVG lighting turns each glyph into a machined metal plate: the alpha is blurred into a height map, then feDiffuseLighting paints the metal body while feSpecularLighting drops a sharp hotspot right on the beveled rim. Pick steel, brass, copper or gunmetal and aim the distant light — engraved, cast and unmistakably three-dimensional, not a flat shadow trick.",
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
  "heat-haze":
    "The word seen through rising hot air — a fast, fine SVG turbulence shimmers the glyph edges like a desert mirage. Finer and quicker than Liquid Warp's underwater wobble.",
  "ink-bleed":
    "Solid ink soaked a little into paper: an feMorphology dilate fattens the glyphs and a turbulence displacement frays the edges into capillary fingers, with a faint soak halo. Letters stay separate. Static.",
  "flame-edges":
    "An SVG turbulence filter physically distorts the glyph contours so the letter edges writhe and lick upward like live fire, boiled by SMIL-animated noise with no JavaScript. The letters are filled with a rising fire gradient — deep-red base through orange to white-yellow tips — under a warm drop-shadow glow, and a single knob walks the whole palette from flame-orange to cool blue-flame.",
  "wave-crest":
    "Water fills the letters with a real rolling surf: the level holds at mid-height while a shaped sine crest travels sideways as an SVG wave mask, topped by a bright foam line riding the exact same curve. Below the crest a deep aqua gradient fills the glyphs and above it they read as a hollow stroked outline, with a gentle vertical bob making the whole body swell.",
  "frost-creep":
    "A warm word slowly freezes over: a pale blue-white crystalline copy creeps across the glyphs behind a soft, turbulence-warped mask front, holds fully frozen with a pulsing cold glow, then thaws back to warm. A slow atmospheric loop built from an SVG displacement filter and an animated gradient mask.",
  "icicles":
    "Frozen crystalline lettering with a band of sharp icicles hanging off the baseline: a cold blue-white gradient fills the glyphs behind a frosty stroke, while a double row of downward spikes at varied lengths reads organic rather than a perfect zigzag. A slow specular glint drifts across the ice for a quiet winter shimmer.",
  "particle-dissolve":
    "A Thanos-snap dissolve: an SVG displacement filter shatters the word into a fine drift of dust that scatters and lifts away, then re-forms, sitting legible for most of the loop. Pure CSS and SVG with SMIL-animated scale, blur, offset and alpha — a dramatic disintegrate-and-reassemble cycle.",
  "caustics":
    "Sunlight caustics ripple across the letters like light on a pool floor: the glyphs sit in a deep-aqua gradient while thin, branching white-cyan webs — an SVG turbulence spiked into ridge lines — drift and shimmer inside them. Two layers at different scales crawl at different speeds for real underwater depth, clipped strictly to the text with a soft blue bloom.",
  "mercury-metaball":
    "A gooey SVG filter fuses the letters with drifting satellite droplets that get pinched into the letterforms and absorbed, all wrapped in a silvery chrome gradient swept by a moving specular highlight and a cool reflective glow. Liquid mercury in motion — reflective, metallic and hypnotic, and it stays legible on dark or light backgrounds.",
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
  "grain-gradient":
    "A restrained low-saturation gradient with a faint film grain dusted over the glyphs (SVG noise) — the matte, tactile gradient finish on modern brand type.",
  "bokeh-fill":
    "A stack of large, feathered radial-gradient discs — the defocused circles-of-confusion of city lights through a wide-open lens — clipped into the glyphs over a dark backdrop. Each disc drifts at its own lazy pace and a couple breathe in size for a twinkle, warming to amber-and-white orbs on the light theme so the fill still reads as photographic.",
  "woven-mesh":
    "Two crossed repeating-gradient masks intersect via mask-composite so only their crossing squares survive, punching a grid of tiny holes clean through every letter like woven metal grille. Flip to Diamond for a criss-crossed weave, or flick on Crawl to drift the mesh slowly through the glyphs.",
  "knockout-panel":
    "The text is punched clean through a vivid sticker panel — a padded, rounded chip whose gradient sweeps, bursts, or spins behind the letters while the glyphs themselves read as bare holes to the page beneath. Three gradient styles and an optional slow drift keep the panel alive without ever touching the cut-out shape of the type.",
  "blend-invert":
    "A self-contained backdrop of drifting two-tone stripes sits behind the glyphs, and mix-blend-mode: difference inverts a near-white duplicate wherever the boundary crosses it. The invert line sweeps continuously through the letterforms as the bands drift — bright over the dark stripe, dark over the light one — walled off inside the scope so the blend never touches the page.",
  "matrix-rain":
    "Columns of glowing green code-rain fall through the glyphs at different speeds over a dark green-black base, with brighter, faster head streaks leading the pack and a phosphor-green glow. An honest pure-CSS approximation of the Matrix effect — clipped, vertically-scrolling gradient streaks rather than real characters — that reads on both dark and light backgrounds.",
  "equalizer-bars":
    "Each glyph is filled with a bank of neon columns whose heights bounce independently on their own timers, like a music visualizer's bar meter poured into your letters. It's pure CSS rhythm with a dark in-glyph base and a faint neon outline — no audio involved, it just looks like it's dancing to a track.",
  "marble-fill":
    "Multi-octave SVG fractal noise is knife-edge thresholded into thin, meandering high-contrast veins with a faint cloudy mottle, composited inside the letters over a stone-base gradient with a polished top sheen and soft contact shadow. Pick white Carrara with gray veining, black Nero with pale veins, or green Verde with calcite threads — a fill that reads as cut, polished marble.",
  "led-matrix":
    "The word rendered as lit pixels on a dot-matrix scoreboard: an emissive radial-gradient LED grid clipped to the letters, glowing against a dark display board whose dimmer sockets sit unlit on the same grid. Classic red, amber or green hardware with a backlit bloom and a slow refresh scan.",
  "wood-grain":
    "Glyphs cut from planed timber: an anisotropic SVG turbulence stretches the noise into long horizontal fibers, which a component-transfer remaps into repeating dark-and-light ring bands over a warm brown base — tunable from pale pine through walnut to deep mahogany. A soft vertical sheen and a darker sawn-edge rim finish the boards, so the letters read as obviously wood, not marble.",
  "embroidery-stitch":
    "The word sewn in thread: a tight diagonal satin-stitch fill of fine dark/light floss ridges with a bright sheen line, ringed by a contrasting running-stitch outline chopped into dashes. An optional woven-linen backing chip turns any letters into a hand-embroidered patch.",
  "varsity-patch":
    "A collegiate letterman patch: the glyphs fill with a low-contrast chenille fiber fuzz — two mismatched repeating-radial-gradient fields interfering over a sheened team-color base — wrapped in three nested sewn rings of cream felt, deep team color, and dark stitch built from stacked multi-directional hard text-shadows. A soft directional drop-shadow lifts the whole patch off the page like it's appliqued on, with crimson, navy, and forest team defaults.",
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
  "weight-wave":
    "Each letter's variable-font weight swells light to heavy and back, offset by index so a wave of boldness rolls across the word (Recursive wght axis).",
  "slant-wave":
    "Each letter leans upright to italic and back on the variable font's slant axis — a true type-axis lean rippling through the word, not a skew.",
  "weight-pulse":
    "The whole word breathes from thin to heavy on the variable font's weight axis. A smooth, single-element weight throb.",
  "casual-morph":
    "The letterforms reshape between a precise sans and a relaxed hand-drawn casual style (Recursive's CASL axis), with a touch of slant. Glyph morphing in pure CSS.",
  "mono-shift":
    "The type morphs between a proportional sans and a monospace face on the variable font's MONO axis, the letters widening and squaring off in sync.",
  "arc-text":
    "The word is arranged on a circular arc — letters dropped and tilted tangent to the curve via cos() — for an arched headline or a downward smile. Bends in on load.",
  "wave-text":
    "Letters frozen along a sine ribbon, each offset and tilted to its slope, so the word forms a static S-curve. A fixed wave shape, not a moving bob.",
  "fan-text":
    "Letters splay out like a hand of cards, each rotated about a low pivot by its distance from the center. Fans open on load.",
  "slope-text":
    "The word sits on a straight diagonal incline, each letter stepped and the set tilted to match — climbing or descending. Slides onto the slope on load.",
  "zigzag-text":
    "Alternate letters sit high and low with matching tilts — a jagged sawtooth ribbon that snaps into place on load.",
  "bulge-text":
    "A fish-eye on the word: the center letters scale up and the ends taper via cos(), like a lens. Pops in on load.",
  "kerning-drift":
    "The letters breathe sideways, each sliding a hair left and right on a shared rhythm but phase-offset by index, so the spacing gently opens and closes. Transform-only, subtle, looping.",
  "decode-reveal":
    "Each letter resolves out of a blurred, skewed, jittering state into crisp type, staggered so a decode sweep runs across the word. A pure-CSS staged glitch entrance (not a random-glyph scramble).",
  "sliced-type":
    "A word cut clean along a tunable diagonal line: two data-text halves, each clipped to its side of the seam, fly apart on entrance, hold a beat, then settle back — but not quite flush, leaving a crisp hairline gap as the permanent signature. No RGB tints, no jitter, just a katana-sharp reveal.",
  "ticker-scroll":
    "A seamless news-ticker: two identical copies of your text scroll in an endless conveyor loop, with the strip's edges dissolving glyphs in and out via a soft mask fade. Hover pauses the scroll — the classic ticker-tape convention, done in pure CSS.",
  "confetti-burst":
    "A celebration entrance: the word pops in with a scale overshoot while dozens of tiny colored rectangles and dots explode radially from behind it, spinning and falling under fake gravity before they fade, topped with a quick expanding shockwave ring. Two counter-rotating pseudo-element layers carry the particles, settling to clean multi-hue lettering in a party palette derived from one base hue.",
  "shatter-in":
    "Six or eight glass shards, each a differently clip-path'd copy of the word, fly in from scattered angles and tumble through 3D space before snapping into perfect registration, a bright edge-flash selling the impact. A hard geometric shatter-reassembly entrance whose shards tile the text box exactly once so every glyph lands precisely.",
  "odometer-roll":
    "Each letter spins into place like a mechanical odometer: a vertical reel of neighbouring glyphs rolls upward inside a fixed, overflow-clipped window and lands on the target with a small settling bounce, staggered left to right. Digits wrap through 0-9 and letters through the alphabet, framed in counter cells with drum-curved top and bottom shading for a hardware feel (per-letter markup).",
  "split-flap":
    "An airport Solari departure board: every letter sits on its own dark rounded chip split by a hinge line, and the blank top card clacks down two to five times in an accelerating-then-settling rhythm before folding away to reveal the bright glyph, cascading across the line by index. Choose amber, white or phosphor-green — the mechanics are sold through hinge shadow and motion rather than fake intermediate characters (per-letter markup).",
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
  "scribble-underline":
    "A hand-drawn rough rule that sketches itself on under the word — a flat bar warped by an SVG displacement filter into a wobbly ink squiggle, drawn left-to-right. Looser than the tidy wavy underline.",
  "emphasis-pop":
    "Native East-Asian emphasis marks crown each glyph from above via text-emphasis — a dot, circle, sesame or triangle, no extra DOM required. Letters and their marks pop into place together in a bouncy, staggered entrance, with the mark's hue carrying the color while the text itself stays theme-neutral.",
  "rolling-squiggle":
    "A wavy underline strip whose sine pattern rolls sideways forever, like a ribbon scrolling beneath the word. Built from a tiny inline SVG wave tile — hue baked straight into the stroke — repeated as a background and marched via an animated background-position-x for a seamless, endless roll.",
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
  "cursor-flashlight":
    "The word sits dim until your cursor sweeps over it, lighting a bright glowing disc that tracks the pointer. A flashlight reveal driven by a tiny script.",
  "focus-lens":
    "The word is soft and out of focus everywhere except a sharp disc under your cursor, which tracks the pointer like a magnifying lens.",
  "weight-ripple-hover":
    "Hovering sends a wave of boldness sweeping through the letters via per-letter variable-font weight transitions — a ripple of weight, no JavaScript.",
  "gradient-link":
    "A clean neutral heading that crossfades into a soft gradient on hover — the understated fill-with-color-on-hover treatment from modern docs and marketing links.",  "neon-selection":
    "The payoff is dormant until you drag-select the text: the selection inverts the glyphs, flipping the background to the text's resting hue and the foreground to a blazing bright tone while a layered neon bloom ignites. At rest it's a restrained two-tone heading with a faint underline and a slow glow pulse — just enough hint to invite the select.",
  "border-draw":
    "Hover the word and a frame draws itself around it stroke by stroke, top then right then bottom then left, like a pen tracing a rectangle. Leave and it retracts in reverse; a faint corner-tick hint keeps the frame legible even at rest.",

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
