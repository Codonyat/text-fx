import type { Capability, EffectDefinition } from "@/lib/engine/types";

import dualNeon from "./neon-glow/dual-neon";
import neonGlow from "./neon-glow/neon-glow";
import pulseGlow from "./neon-glow/pulse-glow";
import softGlow from "./neon-glow/soft-glow";
import neonSignFrame from "./neon-glow/neon-sign-frame";
import halation from "./neon-glow/halation";
import scrollCharge from "./neon-glow/scroll-charge";
import colorCycleGlow from "./neon-glow/color-cycle-glow";
import letterFlicker from "./neon-glow/letter-flicker";
import sparkleGlints from "./neon-glow/sparkle-glints";
import neonTubeDraw from "./neon-glow/neon-tube-draw";
import conicSpin from "./gradient-fill/conic-spin";
import duotoneFill from "./gradient-fill/duotone-fill";
import gradientFlow from "./gradient-fill/gradient-flow";
import meshGradient from "./gradient-fill/mesh-gradient";
import gradientGlow from "./gradient-fill/gradient-glow";
import gradientFollow from "./gradient-fill/gradient-follow";
import spotlight from "./gradient-fill/spotlight";
import softDuotone from "./gradient-fill/soft-duotone";
import candyGloss from "./gradient-fill/candy-gloss";
import dropCap from "./gradient-fill/drop-cap";
import radarSweep from "./gradient-fill/radar-sweep";
import plasmaEnergy from "./gradient-fill/plasma-energy";
import scrollReveal from "./gradient-fill/scroll-reveal";
import chrome from "./metallic-holographic/chrome";
import goldFoil from "./metallic-holographic/gold-foil";
import holographic from "./metallic-holographic/holographic";
import shineSweep from "./metallic-holographic/shine-sweep";
import oilSlick from "./metallic-holographic/oil-slick";
import brushedMetal from "./metallic-holographic/brushed-metal";
import glassFrost from "./metallic-holographic/glass-frost";
import glareSweep from "./metallic-holographic/glare-sweep";
import holoPointer from "./metallic-holographic/holo-pointer";
import sheen from "./metallic-holographic/sheen";
import glassPill from "./metallic-holographic/glass-pill";
import liquidLens from "./metallic-holographic/liquid-lens";
import extrude3d from "./threed-depth/extrude-3d";
import isometric3d from "./threed-depth/isometric-3d";
import longShadow from "./threed-depth/long-shadow";
import retro3d from "./threed-depth/retro-3d";
import paperCutout from "./threed-depth/paper-cutout";
import perspectiveTilt from "./threed-depth/perspective-tilt";
import floating3d from "./threed-depth/floating-3d";
import parallaxLayers from "./threed-depth/parallax-layers";
import nablaIso from "./threed-depth/nabla-iso";
import balloonPuff from "./threed-depth/balloon-puff";
import synthwaveGrid from "./threed-depth/synthwave-grid";
import pointerTilt from "./threed-depth/pointer-tilt";
import cubeSpin from "./threed-depth/cube-spin";
import scrollParallax from "./threed-depth/scroll-parallax";
import scrollFlip from "./threed-depth/scroll-flip";
import bungeeLayers from "./threed-depth/bungee-layers";
import doubleOutline from "./outline-stroke/double-outline";
import filledOutline from "./outline-stroke/filled-outline";
import gradientStroke from "./outline-stroke/gradient-stroke";
import outline from "./outline-stroke/outline";
import glowOutline from "./outline-stroke/glow-outline";
import outline3dExtrude from "./outline-stroke/outline-3d-extrude";
import sticker from "./outline-stroke/sticker";
import sketchOutline from "./outline-stroke/sketch-outline";
import marchingAnts from "./outline-stroke/marching-ants";
import flowingStroke from "./outline-stroke/flowing-stroke";
import glitchRgb from "./glitch-distortion/glitch-rgb";
import scanlineGlitch from "./glitch-distortion/scanline-glitch";
import shakeGlitch from "./glitch-distortion/shake-glitch";
import vhs from "./glitch-distortion/vhs";
import blockGlitch from "./glitch-distortion/block-glitch";
import colorSplit from "./glitch-distortion/color-split";
import terminalPhosphor from "./glitch-distortion/terminal-phosphor";
import crtCollapse from "./glitch-distortion/crt-collapse";
import prismFringe from "./glitch-distortion/prism-fringe";
import datamoshSmear from "./glitch-distortion/datamosh-smear";
import tvStatic from "./glitch-distortion/tv-static";
import scrollGlitch from "./glitch-distortion/scroll-glitch";
import vaporwave from "./retro-themed/vaporwave";
import distressStamp from "./retro-themed/distress-stamp";
import chalkboard from "./retro-themed/chalkboard";
import risoMisregister from "./retro-themed/riso-misregister";
import pixel8bit from "./retro-themed/pixel-8bit";
import blueprint from "./retro-themed/blueprint";
import safetyStencil from "./retro-themed/safety-stencil";
import hudTargeting from "./retro-themed/hud-targeting";
import marqueeBulbs from "./retro-themed/marquee-bulbs";
import artDeco from "./retro-themed/art-deco";
import graffitiSpray from "./retro-themed/graffiti-spray";
import ransomNote from "./retro-themed/ransom-note";
import tornPaper from "./retro-themed/torn-paper";
import honkShine from "./retro-themed/honk-shine";
import dropShadow from "./shadow-press/drop-shadow";
import emboss from "./shadow-press/emboss";
import hardOffset from "./shadow-press/hard-offset";
import letterpress from "./shadow-press/letterpress";
import long45 from "./shadow-press/long-45";
import engrave from "./shadow-press/engrave";
import rainbowStack from "./shadow-press/rainbow-stack";
import bevelPlate from "./shadow-press/bevel-plate";
import aurora from "./elemental/aurora";
import fire from "./elemental/fire";
import gooey from "./elemental/gooey";
import ice from "./elemental/ice";
import waterFill from "./elemental/water-fill";
import moltenLava from "./elemental/molten-lava";
import smokeDrift from "./elemental/smoke-drift";
import lightning from "./elemental/lightning";
import meltDrip from "./elemental/melt-drip";
import heatHaze from "./elemental/heat-haze";
import inkBleed from "./elemental/ink-bleed";
import flameEdges from "./elemental/flame-edges";
import waveCrest from "./elemental/wave-crest";
import frostCreep from "./elemental/frost-creep";
import icicles from "./elemental/icicles";
import particleDissolve from "./elemental/particle-dissolve";
import caustics from "./elemental/caustics";
import mercuryMetaball from "./elemental/mercury-metaball";
import imageFill from "./fill-texture/image-fill";
import starfield from "./fill-texture/starfield";
import stripeFill from "./fill-texture/stripe-fill";
import halftoneDots from "./fill-texture/halftone-dots";
import camouflageFill from "./fill-texture/camouflage-fill";
import scrollingTexture from "./fill-texture/scrolling-texture";
import grainGradient from "./fill-texture/grain-gradient";
import bokehFill from "./fill-texture/bokeh-fill";
import wovenMesh from "./fill-texture/woven-mesh";
import knockoutPanel from "./fill-texture/knockout-panel";
import blendInvert from "./fill-texture/blend-invert";
import matrixRain from "./fill-texture/matrix-rain";
import equalizerBars from "./fill-texture/equalizer-bars";
import marbleFill from "./fill-texture/marble-fill";
import ledMatrix from "./fill-texture/led-matrix";
import woodGrain from "./fill-texture/wood-grain";
import embroideryStitch from "./fill-texture/embroidery-stitch";
import varsityPatch from "./fill-texture/varsity-patch";
import fadeIn from "./entrance-kinetic/fade-in";
import letterWave from "./entrance-kinetic/letter-wave";
import staggerReveal from "./entrance-kinetic/stagger-reveal";
import typewriter from "./entrance-kinetic/typewriter";
import jellyWobble from "./entrance-kinetic/jelly-wobble";
import blurFocusIn from "./entrance-kinetic/blur-focus-in";
import flipIn3d from "./entrance-kinetic/flip-in-3d";
import fallingLetters from "./entrance-kinetic/falling-letters";
import rainbowLetters from "./entrance-kinetic/rainbow-letters";
import maskWipe from "./entrance-kinetic/mask-wipe";
import weightWave from "./entrance-kinetic/weight-wave";
import slantWave from "./entrance-kinetic/slant-wave";
import weightPulse from "./entrance-kinetic/weight-pulse";
import casualMorph from "./entrance-kinetic/casual-morph";
import monoShift from "./entrance-kinetic/mono-shift";
import arcText from "./entrance-kinetic/arc-text";
import waveText from "./entrance-kinetic/wave-text";
import fanText from "./entrance-kinetic/fan-text";
import slopeText from "./entrance-kinetic/slope-text";
import zigzagText from "./entrance-kinetic/zigzag-text";
import bulgeText from "./entrance-kinetic/bulge-text";
import kerningDrift from "./entrance-kinetic/kerning-drift";
import decodeReveal from "./entrance-kinetic/decode-reveal";
import slicedType from "./entrance-kinetic/sliced-type";
import tickerScroll from "./entrance-kinetic/ticker-scroll";
import confettiBurst from "./entrance-kinetic/confetti-burst";
import shatterIn from "./entrance-kinetic/shatter-in";
import odometerRoll from "./entrance-kinetic/odometer-roll";
import splitFlap from "./entrance-kinetic/split-flap";
import swooshIn from "./entrance-kinetic/swoosh-in";
import circleSpin from "./entrance-kinetic/circle-spin";
import spiralText from "./entrance-kinetic/spiral-text";
import scrollMorph from "./entrance-kinetic/scroll-morph";
import scrollSpread from "./entrance-kinetic/scroll-spread";
import scrollLetters from "./entrance-kinetic/scroll-letters";
import folditFold from "./entrance-kinetic/foldit-fold";
import highlighter from "./decoration-underline/highlighter";
import slideUnderline from "./decoration-underline/slide-underline";
import wavyUnderline from "./decoration-underline/wavy-underline";
import gradientUnderline from "./decoration-underline/gradient-underline";
import marchingUnderline from "./decoration-underline/marching-underline";
import centerGrowUnderline from "./decoration-underline/center-grow-underline";
import strikeThrough from "./decoration-underline/strike-through";
import scribbleUnderline from "./decoration-underline/scribble-underline";
import emphasisPop from "./decoration-underline/emphasis-pop";
import rollingSquiggle from "./decoration-underline/rolling-squiggle";
import hoverSpotlight from "./interactive-advanced/hover-spotlight";
import mirrorReflection from "./interactive-advanced/mirror-reflection";
import echoTrail from "./interactive-advanced/echo-trail";
import hoverRipple from "./interactive-advanced/hover-ripple";
import hoverGlint from "./interactive-advanced/hover-glint";
import hoverDepth3d from "./interactive-advanced/hover-depth-3d";
import liquidWarp from "./interactive-advanced/liquid-warp";
import cursorFlashlight from "./interactive-advanced/cursor-flashlight";
import focusLens from "./interactive-advanced/focus-lens";
import weightRippleHover from "./interactive-advanced/weight-ripple-hover";
import gradientLink from "./interactive-advanced/gradient-link";
import neonSelection from "./interactive-advanced/neon-selection";
import borderDraw from "./interactive-advanced/border-draw";
import dockMagnify from "./interactive-advanced/dock-magnify";
import swashBloom from "./interactive-advanced/swash-bloom";
import weightScrub from "./interactive-advanced/weight-scrub";
import cursorRepel from "./interactive-advanced/cursor-repel";
import scrollFill from "./interactive-advanced/scroll-fill";

/** Every implemented effect (hand-maintained: import + array entry per file). */
export const EFFECTS: EffectDefinition[] = [
  dualNeon,
  neonGlow,
  pulseGlow,
  softGlow,
  neonSignFrame,
  halation,
  scrollCharge,
  colorCycleGlow,
  letterFlicker,
  sparkleGlints,
  neonTubeDraw,
  conicSpin,
  duotoneFill,
  gradientFlow,
  meshGradient,
  gradientGlow,
  gradientFollow,
  spotlight,
  softDuotone,
  candyGloss,
  dropCap,
  radarSweep,
  plasmaEnergy,
  scrollReveal,
  chrome,
  goldFoil,
  holographic,
  shineSweep,
  oilSlick,
  brushedMetal,
  glassFrost,
  glareSweep,
  holoPointer,
  sheen,
  glassPill,
  liquidLens,
  extrude3d,
  isometric3d,
  longShadow,
  retro3d,
  paperCutout,
  perspectiveTilt,
  floating3d,
  parallaxLayers,
  nablaIso,
  balloonPuff,
  synthwaveGrid,
  pointerTilt,
  cubeSpin,
  scrollParallax,
  scrollFlip,
  bungeeLayers,
  doubleOutline,
  filledOutline,
  gradientStroke,
  outline,
  glowOutline,
  outline3dExtrude,
  sticker,
  sketchOutline,
  marchingAnts,
  flowingStroke,
  glitchRgb,
  scanlineGlitch,
  shakeGlitch,
  vhs,
  blockGlitch,
  colorSplit,
  terminalPhosphor,
  crtCollapse,
  prismFringe,
  datamoshSmear,
  tvStatic,
  scrollGlitch,
  vaporwave,
  distressStamp,
  chalkboard,
  risoMisregister,
  pixel8bit,
  blueprint,
  safetyStencil,
  hudTargeting,
  marqueeBulbs,
  artDeco,
  graffitiSpray,
  ransomNote,
  tornPaper,
  honkShine,
  dropShadow,
  emboss,
  hardOffset,
  letterpress,
  long45,
  engrave,
  rainbowStack,
  bevelPlate,
  aurora,
  fire,
  gooey,
  ice,
  waterFill,
  moltenLava,
  smokeDrift,
  lightning,
  meltDrip,
  heatHaze,
  inkBleed,
  flameEdges,
  waveCrest,
  frostCreep,
  icicles,
  particleDissolve,
  caustics,
  mercuryMetaball,
  imageFill,
  starfield,
  stripeFill,
  halftoneDots,
  camouflageFill,
  scrollingTexture,
  grainGradient,
  bokehFill,
  wovenMesh,
  knockoutPanel,
  blendInvert,
  matrixRain,
  equalizerBars,
  marbleFill,
  ledMatrix,
  woodGrain,
  embroideryStitch,
  varsityPatch,
  fadeIn,
  letterWave,
  staggerReveal,
  typewriter,
  jellyWobble,
  blurFocusIn,
  flipIn3d,
  fallingLetters,
  rainbowLetters,
  maskWipe,
  weightWave,
  slantWave,
  weightPulse,
  casualMorph,
  monoShift,
  arcText,
  waveText,
  fanText,
  slopeText,
  zigzagText,
  bulgeText,
  kerningDrift,
  decodeReveal,
  slicedType,
  tickerScroll,
  confettiBurst,
  shatterIn,
  odometerRoll,
  splitFlap,
  swooshIn,
  circleSpin,
  spiralText,
  scrollMorph,
  scrollSpread,
  scrollLetters,
  folditFold,
  highlighter,
  slideUnderline,
  wavyUnderline,
  gradientUnderline,
  marchingUnderline,
  centerGrowUnderline,
  strikeThrough,
  scribbleUnderline,
  emphasisPop,
  rollingSquiggle,
  hoverSpotlight,
  mirrorReflection,
  echoTrail,
  hoverRipple,
  hoverGlint,
  hoverDepth3d,
  liquidWarp,
  cursorFlashlight,
  focusLens,
  weightRippleHover,
  gradientLink,
  neonSelection,
  borderDraw,
  dockMagnify,
  swashBloom,
  weightScrub,
  cursorRepel,
  scrollFill,
];

export const EFFECTS_BY_ID: Record<string, EffectDefinition> = Object.fromEntries(
  EFFECTS.map((e) => [e.id, e]),
);

export function getEffect(id: string): EffectDefinition | undefined {
  return EFFECTS_BY_ID[id];
}

export interface EffectMeta {
  id: string;
  name: string;
  category: string;
  tags: string[];
  caps: Capability[];
  animated: boolean;
}

/** Lightweight metadata for the gallery grid. */
export const MANIFEST: EffectMeta[] = EFFECTS.map((e) => ({
  id: e.id,
  name: e.name,
  category: e.category,
  tags: e.tags,
  caps: e.caps,
  animated: e.tags.includes("animated"),
}));
