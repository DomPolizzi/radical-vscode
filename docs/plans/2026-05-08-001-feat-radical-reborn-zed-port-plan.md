---
title: Radical Reborn — Rebrand fork and port to Zed (single-source dual-target build)
type: feat
status: active
date: 2026-05-08
---

# Radical Reborn — Rebrand fork and port to Zed (single-source dual-target build)

## Enhancement Summary

**Deepened on:** 2026-05-08

**Sections enhanced:** Architecture, scope mapping, Phases 1-5, Acceptance Criteria, Risk Analysis, Sources.

**Research agents used:** kieran-typescript-reviewer, code-simplicity-reviewer, architecture-strategist, pattern-recognition-specialist, Zed-schema deep-dive (Explore), APCA implementation (Explore), TM-scope verification (Explore), registry submission workflow (Explore).

### Key changes from initial draft

1. **License must change from ISC → MIT.** ISC is not in the Zed Extensions registry's accepted SPDX list (post Oct 1, 2025). Accepted: MIT, Apache-2.0, BSD-2/3-Clause, GPL-3.0, LGPL-3.0, CC BY 4.0, Unlicense, zlib. The current repo's `LICENSE.md` is ISC, so MIT is the safe pivot.
2. **Initial version `0.1.0`, not `1.0.0`.** Convention check across `extensions.toml` shows 4 of 5 sampled themes start at 0.x. `1.0.0` is non-idiomatic and signals a stability commitment we don't need on day one.
3. **Layout flattened.** `extension.toml` and `themes/radical-reborn.json` go at the **repo root**, not under `extensions/zed/`. This matches every comparable theme repo (catppuccin/zed, dracula/zed, tokyo-night/zed). Eliminates the LICENSE-diff CI step too.
4. **Semantic slot names role-based, editor-neutral.** `ghost → aiCompletionPreview`, `hint → parameterAnnotation`, `subheader → currentScopeBackground`, `gitAdded → vcs.added`. Otherwise `semantic.ts` leaks VSCode lineage.
5. **TM-scope mapping table moved out of `theme/zed/` to `theme/mappings/tm-to-canonical.ts`** so non-TM editor adapters in the future don't import from a Zed-specific dir.
6. **Drop CI Node matrix** (20 + 22) → single Node 22. Theme is a static artifact; matrix is dead weight.
7. **`extension.toml` is template-rendered** from `extension.toml.template` + `package.json:version`, not mutated in place. Same single-source guarantee, no self-modifying tracked file.
8. **Drop `*.tmp + fs.rename` atomic-write pattern.** Replace with `Promise.allSettled` — only commit writes when both adapters succeed.
9. **Trim semantic slots from ~60 → ~30.** YAGNI — many proposed slots were duplicates (`predictive` ≡ `aiCompletionPreview`) or speculative.
10. **`FontStyle` type — replace pre-combined union with flag-based `{ italic?, bold?, underline? }` + serializer.** The string `'italic bold underline'` permutation is fragile and not idiomatic 2026 TS.
11. **Concrete code samples added** for `palette.ts` (`as const satisfies`), Zed JSON shape, APCA `calcAPCA()` usage, and the registry submission runbook.

### New considerations discovered

- Zed's font_style values are **lowercase** (`"italic"`, `"normal"`, `"oblique"`); capitalized values fail schema validation.
- Zed colors must be **8-digit hex** (`#RRGGBBAA`); shorthand and `rgb()` are rejected.
- Zed registry auto-merges theme PRs on CI pass within ~12-24 hours — there's no human review queue for straightforward submissions.
- Zed registry CI runs `pnpm sort-extensions` for idempotence — must run locally before opening PR.
- Zed Tree-sitter cannot express compound TextMate selectors (e.g., `meta.link.inline.markdown punctuation.definition.string`). 13 such compound scopes exist in this repo's language files; each must collapse to its closest single Zed key.
- Markdown fenced code blocks have **no unified Zed scope** (only via `@language` injections); `markup.fenced_code.block.markdown` becomes `text.literal` lossy.

---

## Overview

Fork the existing `radical-vscode` repository (Dan Hedgecock's "Radical" VSCode theme — TS-built, retro-futuristic dark palette) into a maintained personal variant called **Radical Reborn**. The maintained codebase keeps a single TypeScript palette/semantic-token core and grows a second build target for the Zed editor alongside the original VSCode target. Modernize the toolchain to 2026 standards, broaden coverage to newer editor surfaces (AI completion preview, parameter annotations, scope indicator background, semantic tokens, version-control tokens), run an APCA contrast pass, and publish only to the Zed Extensions registry. The VSCode build continues to emit locally for the maintainer's personal use but is not republished to the VSCode Marketplace.

Outcome: one source of truth → two validated theme JSON outputs → one published Zed extension, with build-time gates that prevent palette regressions and broken schemas.

## Problem Statement

The current `radical-vscode` is a 2022-era TS theme that:

- Builds for one editor (VSCode) only.
- Targets `engines.vscode: ^1.40.0` and `node: 16 || 18`, with TS 4.9, ts-node, ESLint 8, Prettier 2.
- Has no coverage for editor surfaces introduced after 2023 — AI completion preview, inlay hints, sticky scroll, modern diff/merge, expanded semantic tokens.
- Has no contrast-validation step; some pairs likely fail APCA Lc 60 against the dark backgrounds.
- Has no schema validation, snapshot tests, or CI.
- Carries a name and publisher (`radical-vscode` / `dhedgecock`) that block this fork from publishing without a rebrand.
- Ships under ISC, which the Zed Extensions registry no longer accepts.

The maintainer wants to (a) make this theme their own, (b) keep using it in VSCode locally, and (c) extend its life by shipping it to Zed, where this maintainer now spends most of their time. The original upstream remains the canonical "Radical" — this fork stakes out its own identity as **Radical Reborn**.

## Proposed Solution

A three-tier token architecture with two thin output adapters and editor-neutral semantic slots.

```
radical-reborn/
  package.json              # name: radical-reborn, version: 0.1.0 (single source of truth)
  extension.toml            # rendered from extension.toml.template at build time
  extension.toml.template   # has {{VERSION}} placeholder; committed
  themes/
    radical-reborn.json     # Zed build output (committed, schema-validated in CI)
  dist/
    RadicalReborn.json      # VSCode build output (committed for personal sideload use)
  LICENSE                   # MIT, no extension (registry rule)
  README.md                 # Repo + Zed-store-facing readme (single file)
  CHANGELOG.md              # 0.1.0 entry
  icon.png                  # current asset reused with attribution
  RadicalReborn.itermcolors # iTerm companion (rebranded; HeckaRad.itermcolors deleted)
  theme/
    palette.ts              # Tier 1 — primitive named hexes
    semantic.ts             # Tier 2 — role-based, editor-neutral semantic slots
    mappings/
      tm-to-canonical.ts    # Tier 2.5 — TM scope → canonical highlight name (used by VSCode + Zed)
    vscode/                 # Tier 3a — VSCode adapter
      workbench.ts
      tokens.ts
      languages/            # Per-language TM overrides (moved from theme/languages/)
      build.ts              # Emits dist/RadicalReborn.json
    zed/                    # Tier 3b — Zed adapter
      style.ts
      syntax.ts             # Imports tm-to-canonical, applies to language scopes
      players.ts
      accents.ts
      build.ts              # Emits themes/radical-reborn.json
    utils/
      alpha.ts              # alpha() helper (current theme/utils.ts:3-4)
      font-style.ts         # FontStyle flag type + renderer
      apca.ts               # checkPair, checkAllPairs (apca-w3 wrapper)
    build-all.ts            # Orchestrator — Promise.allSettled, atomic
  schemas/
    zed-v0.2.0.json         # Pinned schema for offline ajv validation
  .github/
    workflows/
      ci.yml                # Single Node 22 runner: lint, build, schema-validate
  .nvmrc                    # 22
  eslint.config.js          # Flat config (ESLint 9+)
  tsconfig.json             # NodeNext, strict
```

### Research Insights — Architecture

**Pattern compliance (pattern-recognition-specialist):** Three-tier matches Catppuccin's `palette → flavors → port` and Tokyo Night's `colors.ts → mappings`. Rose Pine's two-tier (palette-package only) is a different model — keep the citation precise: rose-pine is precedent for **palette-as-package**, catppuccin for **multi-target adapter pipeline**.

**Coupling (architecture-strategist):** semantic slots must be named by **role**, not by editor surface. Old draft's `ghost`, `hint`, `subheader`, `gitAdded` betrayed VSCode lineage. New role-based names: `aiCompletionPreview`, `parameterAnnotation`, `currentScopeBackground`, `vcs.added`. Adapters translate role → format key. This is the load-bearing decision for "adding a third editor someday is just a new file."

**Cohesion (architecture-strategist):** TM-scope table belongs at `theme/mappings/`, not `theme/zed/`. TM scopes are a VSCode/Sublime concept, not a Zed concept. Co-locating with Zed creates a hidden cross-adapter dependency.

## Technical Approach

### Tier 1 — palette.ts

```ts
// theme/palette.ts
export const palette = {
  PINK_500: '#ff428eff',
  PINK_600: '#ff1998ff',
  TEAL_100: '#a9fef7ff',
  TEAL_200: '#a4ffe4ff',
  LAVENDER_300: '#be8ce7ff',
  CHARTREUSE_100: '#e5fca6ff',
  GRAY_100: '#b4dae9ff',
  GRAY_500: '#45898cff',
  // ... primitive hex stops by hue family
} as const satisfies Record<string, `#${string}`>;

export type PaletteKey = keyof typeof palette;
export type Hex = (typeof palette)[PaletteKey];
```

`as const satisfies` gives both narrowing (every value typed as `#${string}`) and a derivable union (`PaletteKey`). Adapters can type-narrow on `PaletteKey`; chroma-js failures become impossible at compile time.

**Note on hex format:** Zed requires 8-digit hex (`#RRGGBBAA`). VSCode accepts both 6- and 8-digit. Use 8-digit everywhere in the palette and let the VSCode adapter strip alpha if absent (`alpha === ff`). Saves a conversion step and matches Zed's strictness.

### Tier 2 — semantic.ts (role-based, editor-neutral)

~30 named slots, replacing the original ~10 in `theme/colors.ts:51-63`:

```ts
// theme/semantic.ts
import { palette } from './palette';
import { alpha } from './utils/alpha';

export const semantic = {
  // Backgrounds
  bgPrimary:        '#141322ff',
  bgElevated:       '#1c1a30ff',
  bgUltra:          '#100f1aff',
  currentScopeBackground: '#181626ff', // sticky scroll subheader (Zed); editorStickyScroll.background (VSCode)

  // Foregrounds
  fgPrimary:        palette.GRAY_100,
  fgMuted:          '#94b4c4ff',
  fgPlaceholder:    '#5a6470ff',

  // Accent (the brand color)
  accent:           '#ff428eff',
  accentHover:      '#ff6ba6ff',

  // Syntax (role-based, used by both adapters)
  comment:          palette.GRAY_500,
  constant:         palette.CHARTREUSE_100,
  entity:           '#a6e2e0ff',
  keyword:          '#d5358fff',
  storage:          '#f37ab0ff',
  string:           palette.TEAL_100,
  support:          '#7cb3b6ff',
  variable:         palette.GRAY_100,
  type:             palette.LAVENDER_300,
  invalid:          '#ff427bff',

  // AI / annotations (Zed-modern, VSCode-equivalent)
  aiCompletionPreview: alpha(palette.GRAY_100, 0.42), // ghost text — intentionally low contrast
  parameterAnnotation: '#ff42b788',                    // inlay hints — italic, low-mid contrast

  // Diagnostics
  error:            '#ff1767ff',
  warning:          '#ffd000ff',
  info:             '#93e0e3ff',

  // Version control
  'vcs.added':      '#a3ff57ff',
  'vcs.modified':   '#ffb000ff',
  'vcs.deleted':    '#ff427bff',

  // Diff
  'diff.added':     '#43fdd5ff',
  'diff.removed':   '#fe6082ff',
} as const satisfies Record<string, Hex | `#${string}`>;

export type SemanticKey = keyof typeof semantic;
```

### Tier 3 — Adapter outputs

Use `satisfies` at export boundary, **not** `as const` everywhere — `as const` fights `.push()` calls in `tokenColors[]`.

```ts
// theme/vscode/build.ts (sketch)
import type { VSCodeTheme, VSCodeTokenColor } from './types';
const tokenColors: VSCodeTokenColor[] = [];
// ... populate from semantic + tm-to-canonical
const theme = { /* ... */ } satisfies VSCodeTheme;
```

### TextMate → Canonical highlight mapping (Tier 2.5)

`theme/mappings/tm-to-canonical.ts` is the source of truth for both adapters. Below is the **complete mapping for every TM scope used in the existing repo's language files** (verified by reading `theme/languages/*.ts` and `theme/colors-tokens.ts`):

| TM scope | Canonical key | Confidence | Notes |
| --- | --- | --- | --- |
| `comment` | `comment` | HIGH | base scope |
| `comment.block.documentation` | `comment.doc` | HIGH | |
| `string.quoted.docstring` | `comment.doc` | MEDIUM | Python docstring TM variant |
| `comment.block.documentation storage` | `comment.doc` | LOW | **compound — lossy** |
| `comment.block.documentation entity` | `comment.doc` | LOW | **compound — lossy** |
| `variable.other.jsdoc` | `variable` | MEDIUM | JSDoc-specific scope drops |
| `keyword`, `keyword.control`, `keyword.control.flow`, `keyword.control.export`, `keyword.control.import`, `keyword.control.from`, `keyword.import`, `keyword.control.as` | `keyword` | HIGH | |
| `keyword.operator`, `keyword.operator.type.asserts`, `keyword.operator.expression.is` | `operator` | HIGH | (preserve bold-underline on `asserts`) |
| `storage.type.function` | `keyword` | HIGH | |
| `storage.type.function.arrow` | `operator` | MEDIUM | |
| `storage` | `keyword` | HIGH | |
| `string`, `string.template` | `string` | HIGH | |
| `constant`, `constant.numeric` | `constant` | HIGH | |
| `constant.language.boolean` | `boolean` | HIGH | |
| `constant.language.null`, `constant.language.go` | `constant.builtin` | HIGH | |
| `entity`, `entity.name.type`, `support.type` | `type` | HIGH | |
| `entity.name.function`, `support.function` | `function` | HIGH | |
| `entity.name.tag` | `tag` | HIGH | |
| `support.class.component` | `type` | HIGH | JSX components — Zed Tree-sitter distinguishes via node type |
| `entity.other.attribute-name` | `attribute` (or `property` for YAML) | HIGH | |
| `support.type.property-name.json`, `entity.name.tag.yaml` | `property` | HIGH | |
| `variable`, `variable.parameter` | `variable` / `variable.parameter` | HIGH | |
| `punctuation.definition.tag` | `punctuation.bracket` | HIGH | |
| `punctuation.separator.key-value.html` | `punctuation.delimiter` | HIGH | |
| `meta.tag.structure.any.html`, `meta.tag.inline.any.html` | `tag` | LOW | **compound — structure/inline distinction lost** |
| `source.json punctuation.separator`, `source.yaml punctuation.separator` | `punctuation.delimiter` | LOW | **compound** |
| `source.json punctuation.definition.dictionary`, `source.json punctuation.definition.array`, `source.yaml punctuation.definition.sequence` | `punctuation.bracket` | LOW | **compound** |
| `markup`, `punctuation.definition.heading.markdown` | `punctuation.markup` | MEDIUM | |
| `entity.name.section.markdown` | `title` | HIGH | |
| `markup.bold.markdown` | `emphasis.strong` | HIGH | (preserve bold) |
| `markup.italic.markdown` | `emphasis` | HIGH | (preserve italic) |
| `markup.italic.markdown punctuation.definition` | `punctuation.special` | LOW | **compound** |
| `markup.inline.raw.string.markdown` | `string.special` | MEDIUM | inline code |
| `punctuation.definition.raw.markdown` | `punctuation.markup` | MEDIUM | backticks |
| `meta.link.inline.markdown` | `link_uri` | HIGH | |
| `markup.underline.link` | `link_uri` | HIGH | |
| `meta.link.inline.markdown punctuation.definition.string` | `punctuation.special` | LOW | **compound** |
| `constant.other.reference.link` | `link_text` | MEDIUM | |
| `meta.link.reference.def markup.underline.link` | `link_uri` | LOW | **compound** |
| `meta.link.reference.def punctuation.definition.constant` | `punctuation.special` | LOW | **compound** |
| `punctuation.definition.list.begin` | `punctuation.list_marker` | HIGH | |
| `meta.paragraph.markdown` | `text.literal` | MEDIUM | |
| `markup.fenced_code.block.markdown` | `VSCODE_ONLY` | — | Zed has no unified fenced-block scope |
| `comment.block.html` | `comment` | HIGH | (in markdown context) |
| `meta.separator.markdown` | `punctuation.special` | MEDIUM | horizontal rule |
| `support` | `type` | HIGH | generic framework support |
| `invalid` | `VSCODE_ONLY` | — | Zed uses `hint` for diagnostics, semantically different |
| `source.go` | `VSCODE_ONLY` | — | language-root scope, not highlightable |

13 compound TM selectors are intentionally lossy when mapped to Zed; document them in the file as `// LOSSY: lost ${context}` comments. 3 scopes are `VSCODE_ONLY`. Every other scope used in this repo maps cleanly.

### VSCode workbench → Zed style mapping (key surfaces)

| VSCode key | Zed style key | Semantic slot |
| --- | --- | --- |
| `editor.background` | `editor.background` | `bgPrimary` |
| `editor.foreground` | `editor.foreground` | `fgPrimary` |
| `editor.lineHighlightBackground` | `editor.active_line.background` | (derived) |
| `editorStickyScroll.background` | `editor.subheader.background` | `currentScopeBackground` |
| `editorGhostText.foreground` | `syntax.predictive.color` | `aiCompletionPreview` |
| `editorInlayHint.foreground` | `syntax.hint.color` | `parameterAnnotation` |
| `gitDecoration.addedResourceForeground` | `version_control.added` | `vcs.added` |
| `gitDecoration.modifiedResourceForeground` | `version_control.modified` | `vcs.modified` |
| `gitDecoration.deletedResourceForeground` | `version_control.deleted` | `vcs.deleted` |
| `tab.activeBackground` | `tab.active_background` | `bgPrimary` |
| `statusBar.background` | `status_bar.background` | `bgUltra` |
| `terminal.ansi*` | `terminal.ansi.*` | (full mapping) |
| `peekView.*`, `breadcrumb.*` per-segment | (no Zed equivalent) | VSCODE_ONLY |

Zed-only surfaces (`players[]`, `accents[]`) source from `semantic.ts`; VSCode adapter ignores them.

### FontStyle handling

Replace the `'italic bold underline'` string-permutation union with a flag-based type:

```ts
// theme/utils/font-style.ts
export type FontStyle = {
  italic?: boolean;
  bold?: boolean;
  underline?: boolean;
};

export const renderVSCode = (f: FontStyle): string =>
  [f.italic && 'italic', f.bold && 'bold', f.underline && 'underline']
    .filter(Boolean).join(' ');

// Zed: lowercase, font_style enum is "normal" | "italic" | "oblique"; bold goes to font_weight
export const renderZed = (f: FontStyle) => ({
  font_style: f.italic ? 'italic' as const : 'normal' as const,
  font_weight: f.bold ? 700 as const : undefined,
});
```

### Implementation Phases

#### Phase 1: Foundation — Rebrand + restructure (no behavior change)

**Tasks:**

- Rename `LICENSE.md` → `LICENSE` and **change content from ISC to MIT** (or another accepted SPDX). Cannot symlink per registry rules.
- Update `package.json`:
  - `name: "radical-reborn"`
  - `displayName: "Radical Reborn"`
  - `description` reframed for the fork; preserves attribution to upstream Radical
  - Drop `publisher` (no Marketplace publishing)
  - **`version: "0.1.0"`** (single source of truth — `extension.toml.template` reads via `with { type: 'json' }`)
  - `repository.url` → new fork URL
  - `engines.vscode: ^1.85.0`, `engines.node: ">=22"`
  - `license: "MIT"`
  - `contributes.themes[0].label: "Radical Reborn"`, `path: "./dist/RadicalReborn.json"`
- Rename `Radical.itermcolors` → `RadicalReborn.itermcolors`. Delete `HeckaRad.itermcolors`.
- Refactor:
  - `theme/colors.ts` → split into `theme/palette.ts` (primitives) + `theme/semantic.ts` (role-based slots)
  - `theme/colors-tokens.ts` → `theme/vscode/tokens.ts`
  - `theme/colors-workbench.ts` → `theme/vscode/workbench.ts`
  - `theme/languages/` → `theme/vscode/languages/`
  - `theme/build.ts` → `theme/vscode/build.ts`; emit to `dist/RadicalReborn.json`
  - `theme/utils.ts` → split into `theme/utils/alpha.ts` and `theme/utils/font-style.ts`
- `tsconfig.json`: bump to TS 5.x; `module: "NodeNext"`, `resolveJsonModule: true`, `esModuleInterop: true`.
- Replace `README.md` with rebranded content (single file at root; the registry renders this when published).
- Replace `CHANGELOG.md` with `## [0.1.0] - 2026-05-08 — Initial fork release`. Move upstream changelog to `docs/upstream-CHANGELOG.md`.

**Success criteria:**
- `pnpm build` produces `dist/RadicalReborn.json`. Diff vs prior `dist/Radical.json` shows only name/path field changes.
- All TS files compile under TS 5.x.

**Effort:** ~2-3 hours.

##### Research Insights — Phase 1

- **License pivot is mandatory.** Zed registry validates SPDX identifier from `LICENSE` content. ISC parses but is **not** in the accepted list (MIT, Apache-2.0, BSD-2/3-Clause, GPL-3.0, LGPL-3.0, CC BY 4.0, Unlicense, zlib). Switching to MIT is one-line content swap; record upstream attribution in README footer.
- **Layout flat at root.** Every comparable Zed theme repo (catppuccin/zed, dracula/zed, tokyo-night/zed, alanisme/vscode-themes-for-zed) keeps `extension.toml` and `themes/` at root. Nesting under `extensions/zed/` adds an indirection no peer uses, requires the registry submodule to point deeper, and forces a duplicated LICENSE.
- **`-theme` suffix is convention not requirement.** Registry contains `catppuccin`, `dracula`, `tokyo-night` without the suffix. Plan adopts `radical-reborn-theme` for clarity but call out this isn't enforced.

#### Phase 2: Tooling modernization

**Tasks:**

- Bump devDependencies:
  - `typescript: ^5.5.0`
  - `tsx: ^4.19.0` (replaces `ts-node`)
  - `eslint: ^9.16.0` with `eslint.config.js` flat config
  - `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`: ^8
  - `prettier: ^3.4.0`
  - `@types/node: ^22.0.0`
  - `chroma-js: 2.4.2` (pin exact; v3 ESM-only is deferred)
  - `@types/chroma-js: 2.4.4` (pin exact)
  - `apca-w3: ^0.1.9` for contrast checking
  - `ajv: ^8`, `ajv-cli: ^5`, `ajv-formats: ^3` for schema validation
  - `vitest: ^2` for snapshot + unit tests
- Replace `.eslintrc.js` with `eslint.config.js` (flat config). Drop `eslint-plugin-prettier`; keep `eslint-config-prettier` only.
- `.nvmrc` pinned to `22`.
- Update scripts:
  - `"build": "tsx theme/build-all.ts"`
  - `"build:vscode": "tsx theme/vscode/build.ts"`
  - `"build:zed": "tsx theme/zed/build.ts"`
  - `"lint": "eslint theme tests --max-warnings 0"`
  - `"format": "prettier --write '**/*.{md,ts,json}'"`
  - `"test": "vitest run"`
  - `"validate": "ajv validate -c ajv-formats -s schemas/zed-v0.2.0.json -d themes/radical-reborn.json"`

**Success criteria:**
- Build, lint, test pass on Node 22.
- ESLint flat config has zero rule regressions vs prior `.eslintrc.js`.

**Effort:** ~2-3 hours.

##### Research Insights — Phase 2

- **`chroma-js` v2 + `module: "NodeNext"`.** With `esModuleInterop: true` and `import chroma from 'chroma-js'`, CJS interop works. Pin both `chroma-js` and `@types/chroma-js` exact-version — types lag the runtime API. Skip v3 migration until the rest of the repo is ESM-only.
- **`package.json` version read** via Node 22 stable JSON import attributes:
  ```ts
  import pkg from '../package.json' with { type: 'json' };
  const version: string = pkg.version;
  ```
  Requires `resolveJsonModule: true`. Don't `as const` the whole package.json — half its fields are runtime-mutable.
- **ESLint 10** (Feb 2026) removes `.eslintrc.*` entirely. Pin v9 for stability now; v10 upgrade is non-breaking once flat config is in place.

#### Phase 3: Palette refactor + contrast pass

**Tasks:**

- Codify `palette.ts` as primitive-only (numeric stops by hue family, `as const satisfies`).
- Build `semantic.ts` with ~30 role-based slots (see Tier 2 sample above). Existing values are starting point.
- Implement `theme/utils/apca.ts` using `apca-w3`:
  ```ts
  import { calcAPCA } from 'apca-w3';

  export type ContrastPair = {
    name: string;
    fg: string;
    bg: string;
    minLc: number;
  };

  export type ContrastResult = {
    pair: ContrastPair;
    lc: number;
    pass: boolean;
    gap: number;
  };

  export function checkPair(p: ContrastPair): ContrastResult {
    const lc = Math.abs(calcAPCA(p.fg, p.bg));
    const pass = lc >= p.minLc;
    return { pair: p, lc: Math.round(lc * 100) / 100, pass, gap: pass ? 0 : p.minLc - lc };
  }

  export function checkAllPairs(pairs: ContrastPair[]): ContrastResult[] {
    return pairs.map(checkPair);
  }
  ```
- Inline exemption list as TS `Map` in `theme/utils/apca-exemptions.ts`:
  ```ts
  export const APCA_EXEMPTIONS = new Map<string, { minLc: number; reason: string }>([
    ['aiCompletionPreview', { minLc: 30, reason: 'Intentionally subtle ghost text' }],
    ['parameterAnnotation', { minLc: 30, reason: 'Inlay hints — italic, low-contrast by design' }],
    ['comment', { minLc: 45, reason: 'De-emphasized by design (italic gray)' }],
    ['fgPlaceholder', { minLc: 30, reason: 'Placeholder text' }],
  ]);
  ```
- Build emits `dist/apca-report.txt`; build fails if any non-exempt body-text pair drops below Lc 60.

**Success criteria:**
- Every body-text pair in `semantic.ts` clears Lc 60 against its intended background OR is on the exemption list with a one-line justification.
- Snapshot test pins every emitted hex; intentional palette changes require explicit `pnpm test -u` and PR review.

**Effort:** ~5-7 hours including the contrast review.

##### Research Insights — Phase 3

- **APCA Bronze thresholds** ([apcacontrast.com](https://apcacontrast.com), [SAPC-APCA wiki](https://github.com/Myndex/SAPC-APCA/wiki)):
  - Lc 60: minimum body-text content (14px+)
  - Lc 75: minimum smaller body text (16px/500wt or 18px/400wt)
  - Lc 45: minimum headers/large text
  - Lc 30: spot-readable non-content (placeholders, disabled, hints)
  - Lc 15: minimum non-text (icons, borders)
- **Use `calcAPCA()` over the chained API.** `calcAPCA(fg, bg)` accepts hex strings directly and handles alpha blending. The chain `APCAcontrast(sRGBtoY([r,g,b,a]), sRGBtoY([r,g,b,a]))` works but is needless complexity for build-time scripts.
- **APCA returns signed values** (-108 to +106). Sign indicates polarity (light-on-dark vs dark-on-light); take `Math.abs(...)` for threshold comparisons.

#### Phase 4: Zed adapter

**Tasks:**

- `theme/zed/style.ts` — map `semantic.ts` → Zed v0.2.0 style keys. Cover: surfaces/borders, element states, text/icons, editor (foreground, background, gutter, line numbers, indent guides, **subheader.background**, active_line, document_highlight), tabs/chrome, panels, search, scrollbar, terminal (full ANSI + bright + dim), status/diagnostics, file status, version_control.
- `theme/zed/syntax.ts` — populate `syntax` map keyed by canonical Tree-sitter highlight names. Each entry: `{ color, font_style?, font_weight? }`. Preserve italic on `comment`, bold-underline on `keyword.operator.type.asserts`, etc.
- `theme/mappings/tm-to-canonical.ts` — explicit `Record<TmScope, ZedSyntaxKey | typeof VSCODE_ONLY>` table from the mapping above. `VSCODE_ONLY` is a `Symbol.for('vscode-only')` so it can't accidentally serialize.
- `theme/zed/players.ts` — 8-entry `players[]` array. Each entry `{ cursor: '#RRGGBBff', background: '#RRGGBBff', selection: '#RRGGBB3d' }` (alpha `3d` ≈ 24% per Zed convention).
- `theme/zed/accents.ts` — 7-entry `accents[]` array drawn from PINK/TEAL/LAVENDER/CHARTREUSE families. Used for indent rainbow + accent highlights.
- `theme/zed/build.ts` — assembles:
  ```json
  {
    "$schema": "https://zed.dev/schema/themes/v0.2.0.json",
    "name": "Radical Reborn",
    "author": "<maintainer>",
    "themes": [
      {
        "name": "Radical Reborn",
        "appearance": "dark",
        "style": { /* ... */ }
      }
    ]
  }
  ```
  Note: `players`, `accents`, `syntax` go inside `style`, not as top-level theme fields. Writes to `themes/radical-reborn.json`.
- `theme/build-all.ts` — orchestrator using `Promise.allSettled`. Only writes outputs if both adapters succeed; otherwise prints both errors and exits non-zero. No `*.tmp` rename gymnastics — just don't write at all if either fails.
- `extension.toml.template`:
  ```toml
  id = "radical-reborn-theme"
  name = "Radical Reborn"
  version = "{{VERSION}}"
  schema_version = 1
  authors = ["<your-name> <your-email>"]
  description = "A maintained fork of Radical — retro-futuristic dark theme."
  repository = "https://github.com/<you>/radical-reborn"
  themes = ["themes/radical-reborn.json"]
  ```
  `build-all.ts` reads `package.json:version` and renders the template into `extension.toml` (not in working tree as a mutated file — the `.template` is committed, the rendered file is gitignored or committed as a build artifact).

**Success criteria:**
- `themes/radical-reborn.json` validates against `https://zed.dev/schema/themes/v0.2.0.json` (run `pnpm validate`).
- Every TM scope used in `theme/vscode/languages/` resolves to a canonical key or `VSCODE_ONLY` in `tm-to-canonical.ts`.
- Zed JSON has no VSCode-only fields (`colorSpaceName`, `semanticClass`, `tokenColors`).
- VSCode JSON has no Zed-only fields (`players`, `accents`, `syntax`).
- Local install via Zed Dev Extension renders correctly across editor, panels, terminal, syntax, AI completion preview, parameter annotations.

**Effort:** ~6-10 hours including manual visual review.

##### Research Insights — Phase 4

- **Zed JSON shape gotchas** (verified against `zed-industries/zed/assets/themes/one/one.json` and catppuccin/zed):
  - `font_style` is **lowercase**: `"italic"`, `"normal"`, `"oblique"`. Capitalized values fail schema validation.
  - `font_weight` is integer 100-900 (CSS standard); 700 for bold.
  - Colors must be **8-digit hex** (`#RRGGBBAA`); 6-digit, shorthand, named, and `rgb()` all fail validation.
  - `players[]` length is exactly 8 in the official One theme; the schema may allow 1-8 but practical convention is 8.
  - `accents[]` is typically 7 entries per major reference theme.
  - `name` at top-level is the **family** name; `themes[].name` is the **variant** name.
  - Schema URL is exact: `https://zed.dev/schema/themes/v0.2.0.json` (no trailing slash, exact version).
- **Right-to-left scope resolution** — Zed matches `syntax` keys right-to-left against captures. `keyword.operator.type.asserts` matches more specifically than `keyword`. Define both broad and specific keys; Zed resolves correctly.
- **Compound TM scopes are unmappable.** Tree-sitter captures are flat node names — Zed cannot express "this scope inside that scope." 13 compound scopes in this repo collapse to single best-fit keys; document the lossy mapping in `tm-to-canonical.ts` comments.

#### Phase 5: CI, validation, polish, registry submission

**Tasks:**

- `.github/workflows/ci.yml`:
  - Single Node 22 runner (no matrix).
  - Steps: `pnpm i --frozen-lockfile`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm validate`.
- `tests/snapshots/RadicalReborn.json.snap` and `tests/snapshots/radical-reborn.json.snap` — vitest snapshot diffs against build outputs.
- `tests/scope-coverage.test.ts` — every scope referenced in `theme/vscode/languages/*.ts` appears as a key in `tm-to-canonical.ts`.
- `tests/contrast.test.ts` — runs `checkAllPairs(semantic.ts)`; asserts no non-exempt failures.
- `tests/schema.test.ts` — validates both build outputs against pinned schemas using `ajv` (offline; faster than network fetch).
- `tests/strip.test.ts` — Zed JSON must contain no `colorSpaceName`/`semanticClass`/`tokenColors`; VSCode JSON no `players`/`accents`/`syntax`.
- Refresh `examples/` with modern fixture files (Rust snippet, TS-with-decorators, async generator, Markdown with all features).
- Take 1 high-quality 1600×1000 screenshot of code-in-Zed → `assets/zed-preview.png`. Embed in README.
- Open submission PR to `zed-industries/extensions`:
  1. Fork the repo.
  2. `git submodule add https://github.com/<you>/radical-reborn.git extensions/radical-reborn-theme` (HTTPS URL — SSH is rejected).
  3. Add entry to top-level `extensions.toml`:
     ```toml
     [radical-reborn-theme]
     submodule = "extensions/radical-reborn-theme"
     version = "0.1.0"
     ```
  4. Run `pnpm sort-extensions` (CI checks idempotence).
  5. Open PR; include screenshot in body.
- Document `docs/runbooks/release.md`: bump `package.json:version` → `pnpm build` → review snapshot diff → tag → submodule update PR to `zed-industries/extensions`.

**Success criteria:**
- All CI gates green on main.
- Submission PR to Zed Extensions registry merges cleanly (auto-merge expected on CI pass within ~12-24h).
- Maintainer can sideload `dist/RadicalReborn.json` in VSCode and install Radical Reborn in Zed; both look consistent.

**Effort:** ~5-8 hours including manual testing in both editors.

##### Research Insights — Phase 5

- **Registry CI checks** (verified against `zed-industries/extensions` recent PRs #5897, #5908, #5925, #5958):
  - Submodule URL is HTTPS (SSH rejected).
  - `extensions.toml` and `.gitmodules` parse and are sorted (`pnpm sort-extensions` idempotence).
  - Theme JSONs validate against v0.2.0 schema.
  - `LICENSE` file matches one of 9 accepted SPDX identifiers (MIT, Apache-2.0, BSD-2/3-Clause, GPL-3.0, LGPL-3.0, CC BY 4.0, Unlicense, zlib). **ISC is not accepted** post Oct 2025.
  - License file must be at extension repo root, named `LICENSE` or `LICENCE` (case-insensitive).
- **Auto-merge timing**: PR #5925 merged ~20h after creation; PR #5958 (update) merged in 25 minutes. Updates are faster than new submissions.
- **Common rejection causes:** missing/invalid LICENSE, unsorted `extensions.toml`, SSH submodule URL, schema validation errors, duplicate ID.
- **Rollback** = open another PR to `extensions.toml` lowering version to last-known-good submodule pin. No "yank" mechanism; downgrades are first-class.

## Alternative Approaches Considered

### Two separate repos (one for VSCode, one for Zed)

**Rejected:** Drift is guaranteed within months. Defeats "maintain my own theme."

### Whiskers/Tera template generator (Catppuccin's approach)

**Rejected for v0.1:** Whiskers makes sense at 5+ editor targets and 20+ variants. For 2 targets and 1 variant, TS adapters are simpler, type-safe, and avoid a Rust + Tera dependency. Revisit at editor #3 or variant #3.

### Zed-only — drop VSCode entirely

**Rejected:** Maintainer still uses VSCode locally. Dual-target build is ~2-3 extra hours one-time and provides ongoing utility.

### Use Zed's Theme Builder one-shot conversion

**Rejected as primary path:** Theme Builder is a one-shot from a VSCode JSON paste, not a maintenance pipeline. Diverges immediately on first palette tweak. Useful as a sanity-check during Phase 4 only.

### Snapshot tests + scope-coverage + APCA gate (vs. just "open the editor and look")

**Considered cutting (per simplicity reviewer):** A solo maintainer can eyeball the editor. Counter-argument: these gates are **cheap** (vitest is already pulled in), they catch silent palette drift on `palette.ts` refactors that the eye misses, and the `tm-to-canonical.ts` coverage test is the only thing that prevents a new TM scope from being added without a Zed mapping. **Keeping them** — they're low-effort high-value insurance, not ceremony. Drop the formal exemption-file format; inline as a TS `Map`.

## System-Wide Impact

### Interaction Graph

`pnpm build` → `theme/build-all.ts`:

1. Reads `package.json:version` via JSON import attributes.
2. Imports `theme/vscode/build.ts` and `theme/zed/build.ts`.
3. Each adapter imports `theme/semantic.ts` → `theme/palette.ts`.
4. Zed adapter imports `theme/mappings/tm-to-canonical.ts` (also imported indirectly by VSCode for cross-checks).
5. `Promise.allSettled([vscode, zed])` — only commits writes if both fulfilled. On rejection, prints both errors + exits 1.
6. APCA pass walks `semantic.ts` pairs; emits `dist/apca-report.txt`. Build fails if any non-exempt pair regresses below threshold.
7. Renders `extension.toml.template` → `extension.toml` with version substitution.

### Error & Failure Propagation

- **Palette typo (invalid hex)** → `as const satisfies` rejects at compile time. tsx fails to start.
- **Missing semantic slot** → TS compile error at adapter import.
- **Schema violation** → `ajv` reports failing JSON pointer; `pnpm validate` exits non-zero.
- **APCA regression** → `checkPair` reports `(name) Lc=42, threshold=60, gap=18`. Build fails until pair is fixed or exempted.
- **Unmapped TM scope** → `tests/scope-coverage.test.ts` fails listing all unmapped scopes.
- **Version drift** between `package.json` and `extension.toml`: impossible — `extension.toml` is always rendered from template.

### State Lifecycle Risks

- **Partial build output** → addressed by `Promise.allSettled`. If Zed adapter fails, VSCode output isn't written either. No "VSCode shipped, Zed broken" silent state.
- **Stale snapshots** → CI flags any palette change; PR review must update snapshots intentionally.
- **Registry submodule drift** → release runbook checklist; registry's CI catches version mismatches.

### API Surface Parity

Equivalent surfaces moving in lockstep:
- `editor.background` ↔ `bgPrimary`
- `editorGhostText.foreground` ↔ `aiCompletionPreview` ↔ `syntax.predictive.color`
- `editorInlayHint.foreground` ↔ `parameterAnnotation` ↔ `syntax.hint.color`
- `editorStickyScroll.background` ↔ `currentScopeBackground` ↔ `editor.subheader.background`
- `gitDecoration.{added,modified,deleted}` ↔ `vcs.{added,modified,deleted}` ↔ `version_control.{added,modified,deleted}`

VSCode-only surfaces (no Zed equivalent): `peekView.*`, `breadcrumb.*` per-segment, `notifications.*` per-severity.
Zed-only surfaces (no VSCode equivalent): `players[]`, `accents[]`, `text.placeholder`.

### Integration Test Scenarios

1. **Palette change ripples to both outputs** — change `palette.PINK_500`; both `dist/RadicalReborn.json` and `themes/radical-reborn.json` reflect the change in every dependent surface. Snapshot diff is the test.
2. **New TM scope added to a language file** — `tests/scope-coverage.test.ts` fails until added to `tm-to-canonical.ts`.
3. **Zed v0.3.0 schema lands** with new required key — `pnpm validate` fails on next build; pin schema URL update + adapter populates new key.
4. **Version bump** — `pnpm version 0.2.0` → `package.json` updates → next `pnpm build` re-renders `extension.toml`. No drift possible.
5. **APCA regression after palette tweak** — build exits non-zero with exact pair. Fix or exempt.
6. **Submission PR with version mismatch** — registry CI rejects.

## Acceptance Criteria

### Functional Requirements

- [ ] Repo renamed to `radical-reborn` in `package.json`. Initial version `0.1.0`.
- [ ] License file renamed `LICENSE.md` → `LICENSE` and **content switched to MIT** (or another accepted SPDX identifier).
- [ ] `extension.toml` and `themes/radical-reborn.json` at repo root (not nested).
- [ ] `pnpm build` produces `dist/RadicalReborn.json` and `themes/radical-reborn.json` in one invocation.
- [ ] VSCode JSON has no `null` values, no Zed-only keys (`players`, `accents`, `syntax`).
- [ ] Zed JSON has no VSCode-only keys (`colorSpaceName`, `semanticClass`, `tokenColors`).
- [ ] Zed JSON validates against pinned `https://zed.dev/schema/themes/v0.2.0.json` via `pnpm validate`.
- [ ] Every TM scope in `theme/vscode/languages/*.ts` resolves to a canonical key in `tm-to-canonical.ts` or is `VSCODE_ONLY`.
- [ ] APCA report generated per build; non-exempt body-text pairs all clear Lc 60.
- [ ] AI completion preview, parameter annotations, sticky scroll subheader, semantic tokens, version_control surfaces all themed in both outputs.
- [ ] `extension.toml` `id` ends in `-theme`, `schema_version = 1`, version rendered from `package.json`.
- [ ] Local Zed Dev Extension install renders correctly across editor, panels, terminal, syntax, AI surfaces.
- [ ] Submission PR to `zed-industries/extensions` opens with HTTPS submodule URL and sorted `extensions.toml`.

### Non-Functional Requirements

- [ ] Build under `tsx` completes in < 1s on Node 22.
- [ ] APCA pass adds < 200ms.
- [ ] CI green on Node 22.
- [ ] Strict typing: no `any` in `theme/zed/*` or `theme/semantic.ts`. `palette` and `semantic` exports use `as const satisfies`.
- [ ] FontStyle uses flag type, not pre-combined string union.

### Quality Gates

- [ ] Snapshot tests cover both build outputs; updates require explicit `-u` and PR review.
- [ ] `eslint . --max-warnings 0` passes.
- [ ] No deprecated dependencies (`pnpm audit --prod`).
- [ ] README updated with rebrand, attribution to upstream Radical, install instructions for Zed.

## Success Metrics

- **Functional**: 100% of acceptance criteria met before first registry submission.
- **Adoption (vanity)**: Zed extension installs > 0 within first week.
- **Maintenance burden**: a 1-line palette tweak ripples to both editors with one `pnpm build` and zero manual edits.
- **Regression rate**: zero schema-validation failures or APCA regressions on `main` after CI is in place.

## Dependencies & Prerequisites

- **Personal**: GitHub account; new fork repo `radical-reborn`. No publisher accounts (Zed registry is PR-based to a public repo).
- **Local toolchain**: Node 22 (via `nvm` or `mise`), `pnpm`, `rustup`-installed Rust (Zed Dev Extension install requires Rust; Homebrew Rust is rejected).
- **Editors**: Zed (latest), VSCode (latest stable).

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| ISC license rejected by Zed registry | **CONFIRMED** | High | Switch to MIT in Phase 1. |
| Zed schema bumps to v0.3.x mid-development | Medium | Medium | Pin `$schema` URL; CI catches on next build. Schema is additive in practice. |
| `chroma-js` v2 + tsx interop breakage | Low | Low | Pin exact versions; test in Phase 2. |
| TM-to-Zed scope mapping aesthetic regressions | Medium | Medium | Phase 4 manual visual review against `examples/` fixtures in real Zed. Compound scopes documented as lossy. |
| Compound TM scopes (13 in this repo) cause visible styling regressions | Medium | Low | Document each in `tm-to-canonical.ts` comments; visual review catches issues. |
| Maintainer forgets registry release runbook | Low | High | `docs/runbooks/release.md` checklist + CI gates that prevent invalid JSON from being committed. |
| Upstream Radical adds a feature we want to merge in | Medium | Low | `git remote add upstream <url>`, cherry-pick selectively. |
| Future Zed editor surface (e.g. agent panel `#53162`) unsupported | Medium | Low | Architecture allows adding semantic slots and adapter mappings additively. |
| Zed registry CI rule changes (new license, new schema version) | Medium | Medium | Re-validate before each release; runbook step. |

## Resource Requirements

- **Time**: ~20-30 hours total across 5 phases.
- **Team**: Solo maintainer.
- **Infrastructure**: GitHub Actions free tier, Zed Extensions registry (free).

## Future Considerations

- **Light variant**: derive from same `semantic.ts` with a `mode` parameter. Defer to v0.2.
- **High-contrast variant**: APCA Lc 90+ palette for accessibility.
- **Additional editor targets**: Sublime (TmTheme), JetBrains (XML), Neovim (Lua). Each is a new adapter file consuming the same `semantic.ts` and `tm-to-canonical.ts`.
- **Whiskers/Tera migration**: at 3+ editors and 3+ variants.
- **Palette extraction** as `@<scope>/radical-reborn-palette` npm package — when a third consumer (e.g. Shiki user) appears.
- **Visual regression CI**: Playwright harness opening editors, screenshotting `examples/`, diffing baselines. Significant lift; defer until first regression.

## Documentation Plan

- **`README.md`**: rebranded pitch, install for VSCode (sideload from `dist/`) and Zed (registry link), attribution to upstream Radical, screenshot.
- **`CHANGELOG.md`**: fresh `0.1.0 — Initial fork release` entry. Original at `docs/upstream-CHANGELOG.md`.
- **`docs/architecture.md`**: three-tier token system, where to add a new editor surface, how the build orchestrator works.
- **`docs/runbooks/release.md`**: bump version → build → snapshot review → tag → registry submodule update PR.

## Sources & References

### Internal References

- `theme/colors.ts:1-50` — current palette (refactor target → `theme/palette.ts`)
- `theme/colors.ts:51-63` — current semantic mapping (refactor target → `theme/semantic.ts`)
- `theme/colors-tokens.ts` — current TM token rules
- `theme/colors-workbench.ts` — current VSCode workbench colors (871 lines)
- `theme/build.ts:38-50` — current build entry; null-stripping convention preserved in adapter outputs
- `theme/utils.ts` — `alpha()`, `token()` helpers (refactored target)
- `theme/languages/{comment,go,html,javascript,json,markdown,react,yaml}.ts` — TM scopes feeding `tm-to-canonical.ts`
- `package.json` — name, publisher, version, contributes (rebrand target)
- `LICENSE.md` — currently ISC (rename + content swap to MIT)

### External References — Zed

- [Zed theme JSON schema v0.2.0](https://zed.dev/schema/themes/v0.2.0.json)
- [Zed Themes docs](https://zed.dev/docs/themes)
- [Zed Theme Extensions docs](https://zed.dev/docs/extensions/themes)
- [Developing Zed Extensions](https://zed.dev/docs/extensions/developing-extensions)
- [Zed Language Extensions / Syntax Highlighting](https://zed.dev/docs/extensions/languages)
- [Zed Semantic Tokens](https://zed.dev/docs/semantic-tokens)
- [Zed Theme Builder](https://zed.dev/blog/theme-builder)
- [Zed `one.json` reference theme](https://github.com/zed-industries/zed/blob/main/assets/themes/one/one.json)
- [Zed VSCode theme importer source](https://github.com/zed-industries/zed/tree/main/crates/theme_importer)
- [Zed Extensions registry](https://github.com/zed-industries/extensions)
- [Zed Extensions license validation source](https://github.com/zed-industries/extensions/blob/main/src/lib/license.js)
- Recent registry PRs: [#5897](https://github.com/zed-industries/extensions/pull/5897), [#5908](https://github.com/zed-industries/extensions/pull/5908), [#5925](https://github.com/zed-industries/extensions/pull/5925), [#5958](https://github.com/zed-industries/extensions/pull/5958)
- [Zed inlay-hints theming PR #36219](https://github.com/zed-industries/zed/pull/36219)
- [Zed sticky-scroll readability issue #34654](https://github.com/zed-industries/zed/issues/34654)

### External References — Reference theme ports

- [`alanisme/vscode-themes-for-zed`](https://github.com/alanisme/vscode-themes-for-zed) — converter pipeline, Makefile build
- [`catppuccin/zed`](https://github.com/catppuccin/zed) — multi-flavor template
- [`catppuccin/vscode`](https://github.com/catppuccin/vscode) — TS monorepo + watch task
- [`rose-pine/palette`](https://github.com/rose-pine/palette) — palette-as-package precedent
- [`dracula/zed`](https://github.com/dracula/zed) — hand-curated single-flavor port
- [`ssaunderss/zed-tokyo-night`](https://github.com/ssaunderss/zed-tokyo-night) — single-flavor port
- [`MordFustang21/zed-one-dark-pro`](https://github.com/MordFustang21/zed-one-dark-pro) — One Dark Pro mapping reference

### External References — Tooling & accessibility

- [`tsx` FAQ](https://tsx.is/faq)
- [ESLint flat config migration guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [`apca-w3` npm package](https://www.npmjs.com/package/apca-w3)
- [APCA contrast checker](https://apcacontrast.com/) — WCAG 3 successor for dark themes
- [Myndex/SAPC-APCA wiki](https://github.com/Myndex/SAPC-APCA/wiki) — Bronze/Silver thresholds
- [`apcach`](https://github.com/antiflasher/apcach) — APCA-aware color composition
- [Capellic accessible-colors guide](https://capellic.com/insights/accessible-colors)
- [VSCode `theme-color` reference](https://code.visualstudio.com/api/references/theme-color)
- [VSCode AI-powered suggestions colors](https://code.visualstudio.com/docs/copilot/ai-powered-suggestions)
- [VSCode missing-theme-tokens tracking issue #19735](https://github.com/microsoft/vscode/issues/19735)
- [DeepWiki Zed theme system overview](https://deepwiki.com/zed-industries/zed/10.4-theme-system)

### Related Work

- Upstream: [`DHedgecock/radical-vscode`](https://github.com/DHedgecock/radical-vscode) — original "Radical" theme. This fork attributes and credits.
- Current fork remote: `git@github.com:DomPolizzi/radical-vscode.git` (recreated as `radical-reborn`).
