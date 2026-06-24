import type { Capability, EffectDefinition } from "@/lib/engine/types";

import dualNeon from "./neon-glow/dual-neon";
import neonGlow from "./neon-glow/neon-glow";
import pulseGlow from "./neon-glow/pulse-glow";
import softGlow from "./neon-glow/soft-glow";
import conicSpin from "./gradient-fill/conic-spin";
import duotoneFill from "./gradient-fill/duotone-fill";
import gradientFlow from "./gradient-fill/gradient-flow";
import rainbowFill from "./gradient-fill/rainbow-fill";
import chrome from "./metallic-holographic/chrome";
import goldFoil from "./metallic-holographic/gold-foil";
import holographic from "./metallic-holographic/holographic";
import shineSweep from "./metallic-holographic/shine-sweep";
import extrude3d from "./threed-depth/extrude-3d";
import isometric3d from "./threed-depth/isometric-3d";
import longShadow from "./threed-depth/long-shadow";
import retro3d from "./threed-depth/retro-3d";
import doubleOutline from "./outline-stroke/double-outline";
import filledOutline from "./outline-stroke/filled-outline";
import gradientStroke from "./outline-stroke/gradient-stroke";
import outline from "./outline-stroke/outline";
import glitchRgb from "./glitch-distortion/glitch-rgb";
import scanlineGlitch from "./glitch-distortion/scanline-glitch";
import shakeGlitch from "./glitch-distortion/shake-glitch";
import vhs from "./glitch-distortion/vhs";
import candyStripe from "./retro-themed/candy-stripe";
import pixel8bit from "./retro-themed/pixel-8bit";
import sticker from "./retro-themed/sticker";
import vaporwave from "./retro-themed/vaporwave";
import dropShadow from "./shadow-press/drop-shadow";
import emboss from "./shadow-press/emboss";
import hardOffset from "./shadow-press/hard-offset";
import letterpress from "./shadow-press/letterpress";
import long45 from "./shadow-press/long-45";
import aurora from "./elemental/aurora";
import fire from "./elemental/fire";
import gooey from "./elemental/gooey";
import ice from "./elemental/ice";
import imageFill from "./fill-texture/image-fill";
import starfield from "./fill-texture/starfield";
import stripeFill from "./fill-texture/stripe-fill";
import fadeIn from "./entrance-kinetic/fade-in";
import letterWave from "./entrance-kinetic/letter-wave";
import staggerReveal from "./entrance-kinetic/stagger-reveal";
import typewriter from "./entrance-kinetic/typewriter";
import highlighter from "./decoration-underline/highlighter";
import slideUnderline from "./decoration-underline/slide-underline";
import wavyUnderline from "./decoration-underline/wavy-underline";
import hoverSpotlight from "./interactive-advanced/hover-spotlight";
import mirrorReflection from "./interactive-advanced/mirror-reflection";

/** Every implemented effect (registry generated from lib/effects/<category>/<id>.ts). */
export const EFFECTS: EffectDefinition[] = [
  dualNeon,
  neonGlow,
  pulseGlow,
  softGlow,
  conicSpin,
  duotoneFill,
  gradientFlow,
  rainbowFill,
  chrome,
  goldFoil,
  holographic,
  shineSweep,
  extrude3d,
  isometric3d,
  longShadow,
  retro3d,
  doubleOutline,
  filledOutline,
  gradientStroke,
  outline,
  glitchRgb,
  scanlineGlitch,
  shakeGlitch,
  vhs,
  candyStripe,
  pixel8bit,
  sticker,
  vaporwave,
  dropShadow,
  emboss,
  hardOffset,
  letterpress,
  long45,
  aurora,
  fire,
  gooey,
  ice,
  imageFill,
  starfield,
  stripeFill,
  fadeIn,
  letterWave,
  staggerReveal,
  typewriter,
  highlighter,
  slideUnderline,
  wavyUnderline,
  hoverSpotlight,
  mirrorReflection,
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
