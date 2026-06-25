import type { Capability, EffectDefinition } from "@/lib/engine/types";

import dualNeon from "./neon-glow/dual-neon";
import neonGlow from "./neon-glow/neon-glow";
import pulseGlow from "./neon-glow/pulse-glow";
import softGlow from "./neon-glow/soft-glow";
import colorCycleGlow from "./neon-glow/color-cycle-glow";
import neonSignFrame from "./neon-glow/neon-sign-frame";
import conicSpin from "./gradient-fill/conic-spin";
import duotoneFill from "./gradient-fill/duotone-fill";
import gradientFlow from "./gradient-fill/gradient-flow";
import rainbowFill from "./gradient-fill/rainbow-fill";
import meshGradient from "./gradient-fill/mesh-gradient";
import gradientGlow from "./gradient-fill/gradient-glow";
import gradientFollow from "./gradient-fill/gradient-follow";
import chrome from "./metallic-holographic/chrome";
import goldFoil from "./metallic-holographic/gold-foil";
import holographic from "./metallic-holographic/holographic";
import shineSweep from "./metallic-holographic/shine-sweep";
import oilSlick from "./metallic-holographic/oil-slick";
import brushedMetal from "./metallic-holographic/brushed-metal";
import glassFrost from "./metallic-holographic/glass-frost";
import glareSweep from "./metallic-holographic/glare-sweep";
import holoPointer from "./metallic-holographic/holo-pointer";
import extrude3d from "./threed-depth/extrude-3d";
import isometric3d from "./threed-depth/isometric-3d";
import longShadow from "./threed-depth/long-shadow";
import retro3d from "./threed-depth/retro-3d";
import paperCutout from "./threed-depth/paper-cutout";
import perspectiveTilt from "./threed-depth/perspective-tilt";
import floating3d from "./threed-depth/floating-3d";
import parallaxLayers from "./threed-depth/parallax-layers";
import doubleOutline from "./outline-stroke/double-outline";
import filledOutline from "./outline-stroke/filled-outline";
import gradientStroke from "./outline-stroke/gradient-stroke";
import outline from "./outline-stroke/outline";
import glowOutline from "./outline-stroke/glow-outline";
import outline3dExtrude from "./outline-stroke/outline-3d-extrude";
import glitchRgb from "./glitch-distortion/glitch-rgb";
import scanlineGlitch from "./glitch-distortion/scanline-glitch";
import shakeGlitch from "./glitch-distortion/shake-glitch";
import vhs from "./glitch-distortion/vhs";
import blockGlitch from "./glitch-distortion/block-glitch";
import colorSplit from "./glitch-distortion/color-split";
import terminalPhosphor from "./glitch-distortion/terminal-phosphor";
import candyStripe from "./retro-themed/candy-stripe";
import pixel8bit from "./retro-themed/pixel-8bit";
import sticker from "./retro-themed/sticker";
import vaporwave from "./retro-themed/vaporwave";
import comicPop from "./retro-themed/comic-pop";
import distressStamp from "./retro-themed/distress-stamp";
import balloonPuff from "./retro-themed/balloon-puff";
import cartoonBubble from "./retro-themed/cartoon-bubble";
import westernWood from "./retro-themed/western-wood";
import graffitiSpray from "./retro-themed/graffiti-spray";
import chalkboard from "./retro-themed/chalkboard";
import ransomNote from "./retro-themed/ransom-note";
import dropShadow from "./shadow-press/drop-shadow";
import emboss from "./shadow-press/emboss";
import hardOffset from "./shadow-press/hard-offset";
import letterpress from "./shadow-press/letterpress";
import long45 from "./shadow-press/long-45";
import rainbowStack from "./shadow-press/rainbow-stack";
import engrave from "./shadow-press/engrave";
import aurora from "./elemental/aurora";
import fire from "./elemental/fire";
import gooey from "./elemental/gooey";
import ice from "./elemental/ice";
import waterFill from "./elemental/water-fill";
import moltenLava from "./elemental/molten-lava";
import smokeDrift from "./elemental/smoke-drift";
import lightning from "./elemental/lightning";
import meltDrip from "./elemental/melt-drip";
import imageFill from "./fill-texture/image-fill";
import starfield from "./fill-texture/starfield";
import stripeFill from "./fill-texture/stripe-fill";
import halftoneDots from "./fill-texture/halftone-dots";
import camouflageFill from "./fill-texture/camouflage-fill";
import scrollingTexture from "./fill-texture/scrolling-texture";
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
import highlighter from "./decoration-underline/highlighter";
import slideUnderline from "./decoration-underline/slide-underline";
import wavyUnderline from "./decoration-underline/wavy-underline";
import gradientUnderline from "./decoration-underline/gradient-underline";
import marchingUnderline from "./decoration-underline/marching-underline";
import centerGrowUnderline from "./decoration-underline/center-grow-underline";
import strikeThrough from "./decoration-underline/strike-through";
import hoverSpotlight from "./interactive-advanced/hover-spotlight";
import mirrorReflection from "./interactive-advanced/mirror-reflection";
import echoTrail from "./interactive-advanced/echo-trail";
import hoverRipple from "./interactive-advanced/hover-ripple";
import hoverGlint from "./interactive-advanced/hover-glint";
import hoverDepth3d from "./interactive-advanced/hover-depth-3d";
import liquidWarp from "./interactive-advanced/liquid-warp";
import cursorFlashlight from "./interactive-advanced/cursor-flashlight";
import focusLens from "./interactive-advanced/focus-lens";

/** Every implemented effect (registry generated from lib/effects/<category>/<id>.ts). */
export const EFFECTS: EffectDefinition[] = [
  dualNeon,
  neonGlow,
  pulseGlow,
  softGlow,
  colorCycleGlow,
  neonSignFrame,
  conicSpin,
  duotoneFill,
  gradientFlow,
  rainbowFill,
  meshGradient,
  gradientGlow,
  gradientFollow,
  chrome,
  goldFoil,
  holographic,
  shineSweep,
  oilSlick,
  brushedMetal,
  glassFrost,
  glareSweep,
  holoPointer,
  extrude3d,
  isometric3d,
  longShadow,
  retro3d,
  paperCutout,
  perspectiveTilt,
  floating3d,
  parallaxLayers,
  doubleOutline,
  filledOutline,
  gradientStroke,
  outline,
  glowOutline,
  outline3dExtrude,
  glitchRgb,
  scanlineGlitch,
  shakeGlitch,
  vhs,
  blockGlitch,
  colorSplit,
  terminalPhosphor,
  candyStripe,
  pixel8bit,
  sticker,
  vaporwave,
  comicPop,
  distressStamp,
  balloonPuff,
  cartoonBubble,
  westernWood,
  graffitiSpray,
  chalkboard,
  ransomNote,
  dropShadow,
  emboss,
  hardOffset,
  letterpress,
  long45,
  rainbowStack,
  engrave,
  aurora,
  fire,
  gooey,
  ice,
  waterFill,
  moltenLava,
  smokeDrift,
  lightning,
  meltDrip,
  imageFill,
  starfield,
  stripeFill,
  halftoneDots,
  camouflageFill,
  scrollingTexture,
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
  highlighter,
  slideUnderline,
  wavyUnderline,
  gradientUnderline,
  marchingUnderline,
  centerGrowUnderline,
  strikeThrough,
  hoverSpotlight,
  mirrorReflection,
  echoTrail,
  hoverRipple,
  hoverGlint,
  hoverDepth3d,
  liquidWarp,
  cursorFlashlight,
  focusLens,
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
