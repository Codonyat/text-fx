"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { ControlValue, EffectSpec, Theme } from "@/lib/engine/types";
import { EFFECTS, getEffect } from "@/lib/effects/registry";
import { randomizeValues, render, sanitizeValues, textMetrics } from "@/lib/engine/build";
import { makeRng, randomSeed } from "@/lib/engine/rng";
import { decodeSpec, encodeSpec } from "@/lib/engine/share";
import { copyText } from "@/lib/export/download";
import { track } from "@/lib/analytics";
import {
  loadFavorites,
  newFavId,
  persistFavorites,
  type Favorite,
} from "@/lib/store/favorites";
import { Header } from "./Header";
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

type FlagState = "" | "ok" | "fail";

function flag(
  setter: (v: FlagState) => void,
  ref: { current: number | undefined },
  state: FlagState,
  ms: number,
) {
  setter(state);
  if (ref.current) window.clearTimeout(ref.current);
  ref.current = window.setTimeout(() => setter(""), ms);
}

export function Studio() {
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
  const [copied, setCopied] = useState<FlagState>("");
  const [saved, setSaved] = useState<FlagState>("");
  const [shared, setShared] = useState<FlagState>("");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);

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

  // The per-letter editable ghost is transparent; give it the same text metrics as the
  // styled preview so the (invisible) text lays out identically and the caret lines up
  // with the glyphs you see.
  const ghostStyle: CSSProperties = useMemo(() => {
    const m = textMetrics(values, effect.font);
    return {
      fontFamily: m.font,
      fontWeight: m.weight,
      letterSpacing: `${m.tracking}px`,
      textTransform: m.tt as CSSProperties["textTransform"],
      whiteSpace: "pre",
    };
  }, [values, effect.font]);

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

    let saved: Theme | null = null;
    try {
      saved = localStorage.getItem("textfx_theme") as Theme | null;
    } catch {}
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light"); // first visit: follow the OS; default stays dark otherwise
    }

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
        track("open_share_link");
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
    } catch {}
  }, [theme]);

  // Drop a stale #s= share hash the moment state diverges from it, so a reload
  // doesn't silently revert to the shared spec. (Share / Post write it back.)
  const stripHash = useCallback(() => {
    if (window.location.hash.startsWith("#s=")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

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
    stripHash();
    track("shuffle", { effect: eff.id });
  }, [lockCategory, stripHash]);

  const onControlChange = useCallback(
    (id: string, value: ControlValue) => {
      setValues((prev) => ({ ...prev, [id]: value }));
      setEditedCss(null);
      stripHash();
    },
    [stripHash],
  );

  const onTextChange = useCallback(
    (value: string) => {
      setText(value);
      setEditedCss(null);
      stripHash();
    },
    [stripHash],
  );

  const onToggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    setEditedCss(null);
  }, []);

  const onReplay = useCallback(() => {
    setReplayNonce((n) => n + 1);
  }, []);

  const onCopy = useCallback(async () => {
    const ok = await copyText(cssDisplay);
    if (ok) track("export", { type: "css_copy" });
    flag(setCopied, copyT, ok ? "ok" : "fail", 1400);
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
    const next = [fav, ...favorites];
    const ok = persistFavorites(next);
    setFavorites(next);
    flag(setSaved, saveT, ok ? "ok" : "fail", 1200);
    track("save");
  }, [effect, text, seed, values, theme, favorites]);

  const shareUrl = useCallback(() => {
    const spec: EffectSpec = { v: 1, effectId: effect.id, seed, values, text };
    const hash = "#s=" + encodeSpec(spec);
    window.history.replaceState(null, "", hash);
    return window.location.origin + window.location.pathname + hash;
  }, [effect, seed, values, text]);

  const onShare = useCallback(async () => {
    let url = "";
    try {
      url = shareUrl();
    } catch {}
    const ok = url ? await copyText(url) : false;
    flag(setShared, shareT, ok ? "ok" : "fail", 1400);
    track("share");
  }, [shareUrl]);

  const onLoadFav = useCallback(
    (fav: Favorite) => {
      const eff = getEffect(fav.effectId);
      if (!eff) return;
      setEffectId(eff.id);
      setValues(sanitizeValues(eff, fav.values));
      setSeed(fav.seed);
      setText(fav.word);
      setTheme(fav.theme);
      setEditedCss(null);
      setView("studio");
      stripHash();
    },
    [stripHash],
  );

  const onRemoveFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      persistFavorites(next);
      return next;
    });
  }, []);

  const onPickFromGallery = useCallback(
    (id: string, s: number) => {
      const eff = getEffect(id);
      if (!eff) return;
      setEffectId(eff.id);
      setSeed(s);
      setValues(randomizeValues(eff, makeRng(s)));
      setEditedCss(null);
      setView("studio");
      stripHash();
    },
    [stripHash],
  );

  return (
    <div className="app" data-theme={theme}>
      <StyleHost styles={styleEntries} />
      <Header
        theme={theme}
        view={view}
        onToggleTheme={onToggleTheme}
        onToggleView={() => setView((v) => (v === "studio" ? "gallery" : "studio"))}
      />

      {view === "gallery" ? (
        <Gallery theme={theme} onPick={onPickFromGallery} />
      ) : (
        <>
          <Stage
            key={replayNonce}
            rootClass={live.rootClass}
            text={text}
            caps={live.caps}
            root={live.root}
            defs={live.defs}
            reduceMotion={reduceMotion}
            pristine={text === DEFAULT_TEXT}
            ghostStyle={ghostStyle}
            onTextChange={onTextChange}
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
            onReplay={onReplay}
          />
          <div className={grid.grid}>
            <AdjustPanel effect={effect} values={values} onChange={onControlChange} />
            <CssPanel
              css={cssDisplay}
              copied={copied}
              edited={editedCss !== null}
              onCopy={onCopy}
              onEdit={setEditedCss}
              onRevert={() => setEditedCss(null)}
              exportSlot={
                <ExportMenu
                  effect={effect}
                  values={values}
                  text={text}
                  theme={theme}
                  cssOverride={editedCss}
                />
              }
            />
          </div>
          <SavedStrip items={favItems} onLoad={onLoadFav} onRemove={onRemoveFav} />
        </>
      )}
    </div>
  );
}
