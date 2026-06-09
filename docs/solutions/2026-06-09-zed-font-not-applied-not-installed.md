---
title: "Zed font looks fuzzy / 'theme isn't using my font' — the font wasn't installed"
date: 2026-06-09
tags: [zed, fonts, rendering, fira-code, troubleshooting]
component: docs
---

## Problem

Two related symptoms reported for Radical Reborn in Zed: text looked "fuzzy,"
and the user wasn't sure the theme was using Fira Code. Both had the same root
cause.

## Solution

Two facts resolved it:

1. **A Zed theme cannot set the font.** Zed's theme format has no font-family
   field (only per-token `font_style` / `font_weight`). The font is 100%
   controlled by `buffer_font_family` in `settings.json`. Selecting the theme
   never changes the font.
2. **Zed bundles no fonts — it only uses installed system fonts.** `Fira Code`
   was named in settings but not installed, so Zed silently fell back to its
   default (Zed Plex Mono). On a low-DPI external display that fallback also
   read as fuzzy.

Fix: `brew install --cask font-fira-code`, fully relaunch Zed, confirm with the
ligature test (`=>` `!=` `->` become glyphs). Confirmed-good config: buffer
font 14 / weight 500, UI font 15. See `examples/zed-settings.jsonc`.

On macOS non-Retina/external monitors, also reduce smoothing:
`defaults write dev.zed.Zed AppleFontSmoothing -int 0`.

## Why this matters

The instinct "the theme isn't applying my font" is technically correct but
points at the wrong layer — theme and font are fully separate in Zed. The fast
diagnostic is "is the font even installed?" before touching any settings.

## Related

- Font docs + crisp-rendering + verification checklist: `README.md` → "Recommended font".
- [[2026-06-09-vsce-requires-vscodeignore]] for the VSCode packaging side.
