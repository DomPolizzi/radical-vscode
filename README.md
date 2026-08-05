# Radical Reborn

A maintained fork of Dan Hedgecock's [Radical](https://github.com/DHedgecock/radical-vscode) — a retro-futuristic dark theme — extended for **VSCode** and **Zed**.

> **Status:** v0.1.0 — initial fork release.

## What's different from upstream Radical

- **Zed support** alongside VSCode, built from a single TypeScript palette + semantic-token core.
- **Modernized tooling**: TypeScript 5, tsx, ESLint flat config, Node 22.
- **Coverage for newer editor surfaces**: AI completion preview (ghost text), parameter annotations (inlay hints), sticky scroll subheader, semantic tokens, version-control decorations.
- **APCA contrast pass** to verify body-text legibility.
- **MIT-licensed** (upstream is ISC; Zed Extensions registry no longer accepts ISC).

## Install

In every editor, pick **Radical Reborn** from the theme picker after install
(VSCode/VSCodium/Cursor: `Cmd/Ctrl-K Cmd/Ctrl-T`).

> **After installing:** the theme ships colors only — set up the
> [recommended font](#recommended-font) (copy-paste settings included), and see
> [Overrides](#overrides) to tweak any color without forking the theme.

### VSCodium / Cursor / Windsurf (Open VSX)

Published to the [Open VSX registry](https://open-vsx.org/extension/aquaoctet/radical-reborn).
Open the Extensions panel, search **Radical Reborn**, and install.

> Stock Microsoft VSCode does not use Open VSX — install from the `.vsix` below.

### VSCode (.vsix)

Download `radical-reborn.vsix` from the
[latest release](https://github.com/AquaOctet/radical-reborn/releases) and install:

```sh
code --install-extension radical-reborn.vsix
```

Or in VSCode: Extensions panel → `⋯` menu → **Install from VSIX…**.

### Zed

Install via the Zed Extensions panel: search **Radical Reborn**.

### Build from source (contributors)

```sh
git clone https://github.com/AquaOctet/radical-reborn
cd radical-reborn
npm install
npm run build      # emits dist/RadicalReborn.json + themes/radical-reborn.json
npm run package    # produces radical-reborn.vsix
code --install-extension radical-reborn.vsix
```

## Recommended font

Radical Reborn is a **color theme** — by design, neither VSCode nor Zed lets a
theme bundle or force a font, so the font is yours to choose. We recommend
**[Fira Code](https://github.com/tonsky/FiraCode)** — a free, hugely popular
coding font whose programming ligatures (`=>`, `!=`, `>=`) look great against
this palette's pink operators. [JetBrains Mono](https://www.jetbrains.com/lp/mono/),
Cascadia Code, and MonoLisa are excellent alternatives. Because the theme leans
on **italics** (comments, type names, parameters), prefer a font with a *real*
italic rather than a synthetic one.

**VSCode** — `settings.json`:

```json
{
  "editor.fontFamily": "'Fira Code', 'JetBrains Mono', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6
}
```

**Zed** — `settings.json`:

```json
{
  "buffer_font_family": "Fira Code",
  "buffer_font_features": { "calt": true },
  "buffer_font_size": 14,
  "buffer_font_weight": 500,
  "buffer_line_height": "comfortable",
  "ui_font_size": 15
}
```

> Copy-paste version: [`examples/zed-settings.jsonc`](examples/zed-settings.jsonc).

> Install Fira Code first (`brew install --cask font-fira-code` on macOS, your
> package manager on Linux, or [the release zip](https://github.com/tonsky/FiraCode/releases)).
> `calt` in Zed and `fontLigatures` in VSCode enable the ligatures.

### Crisp rendering on a non-Retina display (macOS)

macOS uses grayscale antialiasing that's sharp on Retina but renders **soft /
fuzzy on low-DPI external monitors** (1080p/1440p). This is an OS rendering
behavior, not the theme. Fixes, most impactful first:

1. **Reduce macOS font-smoothing** — the big lever. In Terminal:

   ```sh
   # Per-app, Zed only (recommended):
   defaults write dev.zed.Zed AppleFontSmoothing -int 0
   # …or globally, for every app:
   defaults write -g AppleFontSmoothing -int 0
   ```

   Fully quit and reopen Zed (the global form needs a logout/login). `0`
   disables the stroke "fattening" that blurs text at low DPI; try `1` if `0`
   looks too thin. Revert with `defaults delete dev.zed.Zed AppleFontSmoothing`.
   (For VSCode, the same trick uses bundle id `com.microsoft.VSCode`, or set
   `"workbench.fontAliasing": "antialiased"`.)

2. **Use a medium font weight** (already in the snippet above) — thicker
   strokes catch more pixels and read crisper: `"buffer_font_weight": 500`.

3. **Keep an integer font size** (14, 15, 16 — not 14.5) and avoid fractional
   display scaling; both blur text at low DPI.

Fira Code's Regular weight is on the light side — if it still feels soft after
the above, **JetBrains Mono** renders noticeably crisper at low DPI.

### Is the font actually applied? (Zed)

A **theme cannot set the font in Zed** — Zed's theme format has no font field,
so Radical Reborn ships colors only. The font comes entirely from your
`settings.json`. Picking "Radical Reborn" in the theme picker changes colors,
never the font. If Fira Code doesn't seem active, check these in order:

1. **Is Fira Code installed?** Zed only uses installed system fonts (it doesn't
   bundle any). On macOS:

   ```sh
   system_profiler SPFontsDataType | grep -i "fira code" || echo "NOT INSTALLED"
   ```

   If missing: `brew install --cask font-fira-code`, then **fully quit and
   relaunch Zed** (fonts load at startup).

2. **Is the setting present?** Open settings (`cmd-,` → `~/.config/zed/settings.json`)
   and confirm a *top-level* key — not inside the theme block:

   ```json
   "buffer_font_family": "Fira Code"
   ```

   The family name must match exactly: `Fira Code` (not `FiraCode`, and Nerd
   Font builds register as `FiraCode Nerd Font`).

3. **Visual proof:** with `"buffer_font_features": { "calt": true }`, type `=>`,
   `!=`, `->`. Fira Code renders these as ligature glyphs. If they stay as
   separate characters, Fira Code isn't the active font.

4. **Still wrong?** Check Zed's log for a fallback:

   ```sh
   tail -n 200 ~/Library/Logs/Zed/Zed.log | grep -i font
   ```

   A "font not found / falling back" line means the name doesn't match an
   installed family — Zed quietly substitutes its default (Zed Plex Mono).

## Overrides

Both editors let you layer your own colors on top of Radical Reborn in
`settings.json` — no fork needed, and your tweaks survive theme updates.

**Zed** — `experimental.theme_overrides` applies to whatever theme is active.
UI keys use the theme's style names; syntax colors nest under `"syntax"`:

```json
{
  "experimental.theme_overrides": {
    "editor.active_line.background": "#cd8ce720",
    "syntax": {
      "comment": { "color": "#7c9c9e", "font_style": null }
    }
  }
}
```

**VSCode / VSCodium** — scope overrides to the theme with a `[Radical Reborn]`
block. Workbench (UI) keys and syntax tokens use separate settings:

```json
{
  "workbench.colorCustomizations": {
    "[Radical Reborn]": {
      "editor.lineHighlightBackground": "#d043cf20"
    }
  },
  "editor.tokenColorCustomizations": {
    "[Radical Reborn]": {
      "comments": "#7c9c9e"
    }
  }
}
```

Key references: [Zed theme keys](https://zed.dev/schema/themes/v0.2.0.json)
(plus `schemas/zed-v0.2.0-extended.json` in this repo for newer engine keys) ·
[VSCode theme color reference](https://code.visualstudio.com/api/references/theme-color).

## Acknowledgements

Original "Radical" theme by **[Dan Hedgecock](https://github.com/DHedgecock)**. This fork preserves the palette philosophy (pink/teal/lavender/chartreuse on a deep purple-black) while extending coverage to modern editor surfaces and porting to Zed.

## License

MIT — see [LICENSE](./LICENSE). Copyright Dan Hedgecock (2018, original) and Aqua (2026, fork).
