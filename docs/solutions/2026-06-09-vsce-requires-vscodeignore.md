---
title: vsce needs a publisher field and a .vscodeignore even for an unpublished .vsix
date: 2026-06-09
tags: [vscode, vsce, packaging, theme, distribution]
component: packaging
---

## Problem

Packaging a VSCode theme into a `.vsix` with `@vscode/vsce` has two non-obvious requirements that bite on first use:

1. **`vsce package` refuses to run without a `publisher` field** in `package.json`, even when you only want a local `.vsix` and never intend to publish to a registry.
2. **Without a `.vscodeignore`, `vsce` bundles the entire repo** — `theme/` source, `tests/`, `docs/`, `node_modules`, and any stray large assets (here, a 1.6 MB root `icon.png`). A theme that should be ~50 KB ends up multi-MB and ships source nobody needs.

## Solution

- Add `"publisher": "<namespace>"` to `package.json`. For us this is `aquaoctet` — and it must equal the **Open VSX namespace** used at publish time, so pick it with that in mind.
- Add a `.vscodeignore` that excludes everything except the runtime artifact + store metadata. For a theme, keep only: `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, `dist/<theme>.json`, and the icon referenced by `package.json:icon`. Use `assets/**` + `!assets/icon.png` to drop all assets but keep the icon.
- Add a `vscode:prepublish` script (`npm run build`) so `vsce package` always rebuilds the theme JSON before packaging — no stale `dist/`.
- **Verify with `unzip -l radical-reborn.vsix`** before publishing. If `theme/`, `tests/`, or `node_modules/` appear, the `.vscodeignore` is wrong.

## Why this matters

The `.vsix` is what users install and what gets uploaded to Open VSX. A bloated package leaks source, slows installs, and can expose files you didn't mean to ship. The `unzip -l` check is the cheap gate that catches it.

## Related

- Packaging tools are invoked via pinned `npx` (`npx --yes @vscode/vsce@^3 …`) rather than `devDependencies`, so `package-lock.json` stays untouched and `npm ci` in CI keeps working. See [[2026-06-09-openvsx-publisher-agreement]] for the publish side.
