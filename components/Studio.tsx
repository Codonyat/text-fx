"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ControlValue, EffectSpec, Theme } from "@/lib/engine/types";
import { EFFECTS, getEffect } from "@/lib/effects/registry";
import { randomizeValues, render, sanitizeValues } from "@/lib/engine/build";
import { makeRng, randomSeed } from "@/lib/engine/rng";
import { decodeSpec, encodeSpec } from "@/lib/engine/share";
import {
  loadFavorites,
  newFavId,
  persistFavorites,
  type Favorite,
} from "@/lib/store/favorites";
import { Header, type Skin } from "./Header";
import { Stage } from "./Stage";
import { ActionBar } from "./ActionBar";
import { AdjustPanel } from "./AdjustPanel";
import { CssPanel } from "./CssPanel";
import { SavedStrip, type SavedItem } from "./SavedStrip";
import { StyleHost, type StyleEntry } from "./StyleHost";
import { ExportMenu } from "./ExportMenu";
import { Gallery } from "./Gallery";
import grid from "./Studio.module.css";

const DEFAULT_EFFECT = EFFECTS[0];
const DEFAULT_TEXT = "type here";

function flag(setter: (v: boolean) => void, ref: { current: number | undefined }, ms: number) {
  setter(true);
  if (ref.current) window.clearTimeout(ref.current);
  ref.current = window.setTimeout(() => setter(false), ms);
}

export function Studio() {
  const [skin, setSkin] = useState<Skin>("brutalist");
  const [theme, setTheme] = useState<Theme>("dark");
  const [view, setView] = useState<"studio" | "gallery">("studio");
  const [lockCategory, setLockCategory] = useState("");

  const [effectId, setEffectId] = useState(DEFAULT_EFFECT.id);
  const [values, setValues] = useState<Record<string, ControlValue>>(() =>
    randomizeValues(DEFAULT_EFFECT, makeRng(1)),
  );
  const [seed, setSeed] = useState(1);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [editedCss, setEditedCss] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const copyT = useRef<number | undefined>(undefined);
  const saveT = useRef<number | undefined>(undefined);
  const shareT = useRef<number | undefined>(undefined);

  const effect = getEffect(effectId) ?? DEFAULT_EFFECT;

  // ---- derived render artifacts ----
  const live = useMemo(
    () => render(effect, values, text, { scope: "fx-live", theme }),
    [effect, values, text, theme],
  );
  const display = useMemo(
    () => render(effect, values, text, { scope: "text-effect", theme }).styleText,
    [effect, values, text, theme],
  );
  const cssDisplay = editedCss ?? display;
  const liveCss = editedCss ? editedCss.split("text-effect").join("fx-live") : live.styleText;

  const favItems: SavedItem[] = useMemo(() => {
    return favorites
      .map((fav) => {
        const eff = getEffect(fav.effectId);
        if (!eff) return null;
        const rendered = render(eff, fav.values, fav.word, {
          scope: `fx-fav-${fav.id}`,
          theme,
          mode: "thumbnail",
        });
        return { fav, rendered };
      })
      .filter((x): x is SavedItem => x !== null);
  }, [favorites, theme]);

  const styleEntries: StyleEntry[] = useMemo(() => {
    const entries: StyleEntry[] = [{ id: "fx-live", css: liveCss }];
    for (const it of favItems) entries.push({ id: it.rendered.scope, css: it.rendered.styleText });
    return entries;
  }, [liveCss, favItems]);

  // ---- mount: media query, favorites, share-URL or first shuffle ----
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onMq);

    try {
      const t = localStorage.getItem("textfx_theme") as Theme | null;
      const s = localStorage.getItem("textfx_skin") as Skin | null;
      if (t === "dark" || t === "light") setTheme(t);
      if (s === "brutalist" || s === "lab") setSkin(s);
    } catch {}

    setFavorites(loadFavorites());

    const hash = window.location.hash.startsWith("#s=") ? window.location.hash.slice(3) : "";
    const spec = decodeSpec(hash);
    if (spec) {
      const eff = getEffect(spec.effectId);
      if (eff) {
        setEffectId(eff.id);
        setValues(sanitizeValues(eff, spec.values));
        setSeed(spec.seed);
        setText(spec.text || DEFAULT_TEXT);
        return () => mq.removeEventListener("change", onMq);
      }
    }
    // first-visit shuffle (post-hydration, client-only)
    doShuffle();
    return () => mq.removeEventListener("change", onMq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("textfx_theme", theme);
      localStorage.setItem("textfx_skin", skin);
    } catch {}
  }, [theme, skin]);

  // ---- actions ----
  const doShuffle = useCallback(() => {
    const pool = lockCategory ? EFFECTS.filter((e) => e.category === lockCategory) : EFFECTS;
    const list = pool.length ? pool : EFFECTS;
    const eff = list[Math.floor(Math.random() * list.length)];
    const s = randomSeed();
    setEffectId(eff.id);
    setSeed(s);
    setValues(randomizeValues(eff, makeRng(s)));
    setEditedCss(null);
  }, [lockCategory]);

  const onControlChange = useCallback((id: string, value: ControlValue) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setEditedCss(null);
  }, []);

  const onToggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    setEditedCss(null);
  }, []);

  const onCopy = useCallback(() => {
    try {
      navigator.clipboard?.writeText(cssDisplay);
    } catch {}
    flag(setCopied, copyT, 1400);
  }, [cssDisplay]);

  const onSave = useCallback(() => {
    const fav: Favorite = {
      id: newFavId(),
      effectId: effect.id,
      name: effect.name,
      word: text,
      seed,
      values,
      theme,
    };
    setFavorites((prev) => {
      const next = [fav, ...prev];
      persistFavorites(next);
      return next;
    });
    flag(setSaved, saveT, 1200);
  }, [effect, text, seed, values, theme]);

  const onShare = useCallback(() => {
    const spec: EffectSpec = { v: 1, effectId: effect.id, seed, values, text };
    const hash = "#s=" + encodeSpec(spec);
    try {
      window.history.replaceState(null, "", hash);
      const url = window.location.origin + window.location.pathname + hash;
      navigator.clipboard?.writeText(url);
    } catch {}
    flag(setShared, shareT, 1400);
  }, [effect, seed, values, text]);

  const onLoadFav = useCallback((fav: Favorite) => {
    setEffectId(fav.effectId);
    setValues(fav.values);
    setSeed(fav.seed);
    setText(fav.word);
    setEditedCss(null);
    setView("studio");
  }, []);

  const onRemoveFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      persistFavorites(next);
      return next;
    });
  }, []);

  const onPickFromGallery = useCallback((id: string) => {
    const eff = getEffect(id);
    if (!eff) return;
    const s = randomSeed();
    setEffectId(eff.id);
    setSeed(s);
    setValues(randomizeValues(eff, makeRng(s)));
    setEditedCss(null);
    setView("studio");
  }, []);

  return (
    <div className="app" data-skin={skin} data-theme={theme}>
      <StyleHost styles={styleEntries} />
      <Header
        theme={theme}
        skin={skin}
        view={view}
        onToggleTheme={onToggleTheme}
        onToggleSkin={() => setSkin((s) => (s === "brutalist" ? "lab" : "brutalist"))}
        onToggleView={() => setView((v) => (v === "studio" ? "gallery" : "studio"))}
      />

      {view === "gallery" ? (
        <Gallery theme={theme} onPick={onPickFromGallery} />
      ) : (
        <>
          <Stage
            rootClass={live.rootClass}
            text={text}
            caps={live.caps}
            root={live.root}
            defs={live.defs}
            reduceMotion={reduceMotion}
            onTextChange={setText}
          />
          <ActionBar
            effectName={effect.name}
            lockCategory={lockCategory}
            saved={saved}
            shared={shared}
            onShuffle={doShuffle}
            onSetLock={setLockCategory}
            onSave={onSave}
            onShare={onShare}
          />
          <div className={grid.grid}>
            <AdjustPanel effect={effect} values={values} onChange={onControlChange} />
            <CssPanel
              css={cssDisplay}
              copied={copied}
              onCopy={onCopy}
              onEdit={setEditedCss}
              exportSlot={
                <ExportMenu effect={effect} values={values} text={text} theme={theme} />
              }
            />
          </div>
          <SavedStrip items={favItems} onLoad={onLoadFav} onRemove={onRemoveFav} />
        </>
      )}
    </div>
  );
}
