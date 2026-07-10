---
title: "Ship Radical Reborn — VSCode (.vsix + Open VSX) and Zed registry publish"
type: feat
status: completed
date: 2026-06-09
origin: docs/plans/2026-05-08-001-feat-radical-reborn-zed-port-plan.md
---

# ✨ Ship Radical Reborn — VSCode (.vsix + Open VSX) and Zed registry publish

## Overview

The five-phase port plan (see origin: `docs/plans/2026-05-08-001-feat-radical-reborn-zed-port-plan.md`) is **done and merged**: rebrand, toolchain modernization, APCA pass, the single-source dual-target build (`theme/build-all.ts` → `dist/RadicalReborn.json` + `themes/radical-reborn.json`), CI, vitest suite, and release/rollback runbooks all landed across PRs #1–#4. The theme can be manually imported into Zed today.

This plan covers the **last mile: real distribution.** Two goals:

1. **VSCode** — a clean, installable artifact instead of the "symlink the whole repo" hack: a packaged **`.vsix`** plus publishing to the **Open VSX registry** (open-vsx.org — used by VSCodium, Cursor, Windsurf, Gitpod). *No Microsoft Marketplace.*
2. **Zed** — execute the existing release runbook: tag `v0.1.0` and open a submodule PR to `zed-industries/extensions`.

A blocking prerequisite for both: **reconcile the repo identity.** The git remote is `git@github.com:AquaOctet/radical-reborn.git`, but `package.json`, `extension.toml`, and the release runbook all reference `https://github.com/DomPolizzi/radical-reborn`. The canonical home is **`AquaOctet/radical-reborn`** (user decision, 2026-06-09).

## Problem Statement / Motivation

- **VSCode usability is fragile.** The only documented install path is `git clone && npm install && npm run build && ln -s "$PWD" ~/.vscode/extensions/radical-reborn`. That ships the entire source tree, `node_modules`, tests, and a 1.6 MB root `icon.png` into the extensions directory, breaks on `git pull` if the build output drifts, and can't be shared as a single file. There is **no `publisher` field, no `.vscodeignore`, and no packaging tool** in the repo.
- **Nothing is actually published anywhere.** There are **zero git tags** and the Zed registry submission has not been opened. The runbook is written but unexecuted.
- **Identity mismatch will break publishing.** A Zed submodule URL must be **public HTTPS** and the metadata URLs feed both the Open VSX listing and the Zed extension page. Shipping with the wrong owner (`DomPolizzi` vs the real `AquaOctet` remote) produces a broken submodule and wrong attribution.

## Proposed Solution

Four sequential phases. Phase 0 unblocks everything; Phases 1–2 (VSCode) and Phase 3 (Zed) are independent after that and can be done in either order; Phase 4 documents what shipped.

```
Phase 0  Repo identity reconciliation        (blocking prerequisite)
Phase 1  VSCode .vsix packaging               ┐ independent of Phase 3
Phase 2  Open VSX publish                     ┘ (builds on Phase 1 artifact)
Phase 3  Zed registry submission              (independent)
Phase 4  Docs, runbooks, learnings            (after the above)
```

No change to the build pipeline, palette, or adapters — this is packaging and distribution only. The single source of truth (`package.json:version`) stays authoritative; the new `.vsix` and Open VSX steps consume the already-built `dist/RadicalReborn.json`.

---

## Technical Approach

### Phase 0 — Repo identity reconciliation (BLOCKING)

Reconcile every `DomPolizzi` reference to `AquaOctet` and ensure the public HTTPS clone works.

**Files to change:**

- `package.json`
  - `repository.url` → `https://github.com/AquaOctet/radical-reborn`
  - `bugs.url` → `https://github.com/AquaOctet/radical-reborn/issues`
- `extension.toml.template` and `extension.toml`
  - `repository = "https://github.com/AquaOctet/radical-reborn"`
  - *(Note: `extension.toml` is build-rendered from the template, but it's also committed — change both, or rebuild after editing the template.)*
- `docs/runbooks/release.md` — replace the `DomPolizzi/radical-reborn` submodule-add URL with `AquaOctet/radical-reborn`.
- `README.md` — the install clone URL (`git clone https://github.com/DomPolizzi/radical-reborn`).

**Git remote (for the Zed submodule HTTPS requirement):**

```bash
git remote set-url origin https://github.com/AquaOctet/radical-reborn
git remote -v   # confirm HTTPS
```

**Prerequisite check:** the GitHub repo at `AquaOctet/radical-reborn` must exist and be **public** (Zed's registry CI clones the submodule anonymously over HTTPS; Open VSX and the Marketplace render the README via the `repository` field). If it's currently private, make it public before Phase 3.

**Success criteria:** `grep -rn "DomPolizzi" .` returns nothing outside `docs/plans/` (historical plan references are fine). `git remote get-url origin` is HTTPS.

---

### Phase 1 — VSCode `.vsix` packaging

Produce an installable `radical-reborn-<version>.vsix` so VSCode users run `code --install-extension radical-reborn-0.1.0.vsix` instead of symlinking the repo.

**1. Add the publisher field** (`@vscode/vsce` refuses to package without it; it also becomes the Open VSX namespace in Phase 2):

```jsonc
// package.json
"publisher": "aquaoctet",   // lowercase; must match the Open VSX namespace created in Phase 2
```

**2. Add `@vscode/vsce` and `ovsx` to devDependencies** (`ovsx` is Phase 2 but install together):

```jsonc
"@vscode/vsce": "^3.2.0",
"ovsx": "^0.10.0",
```

**3. Add `.vscodeignore`** — critical. Without it, `vsce` bundles the entire source tree, tests, docs, `node_modules`, and the 1.6 MB root `icon.png`. A theme only needs the built JSON, manifest, readme, license, changelog, and the icon.

```
# .vscodeignore — ship only the runtime artifact + store metadata
.github/**
.vscode/**
docs/**
examples/**
schemas/**
tests/**
theme/**
themes/**           # Zed output — not used by VSCode
assets/**
!assets/icon.png    # but keep the icon referenced by package.json
node_modules/**
src/**
*.ts
eslint.config.js
vitest.config.ts
tsconfig.json
.prettierrc
.nvmrc
.gitignore
package-lock.json
extension.toml
extension.toml.template
*.itermcolors
dist/apca-report.txt
icon.png            # the 1.6 MB root icon — package.json points at assets/icon.png instead
```

Keep in the package: `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, `dist/RadicalReborn.json`, `assets/icon.png`.

**4. Add npm scripts:**

```jsonc
"package": "vsce package --no-dependencies --out radical-reborn.vsix",
"publish:ovsx": "ovsx publish radical-reborn.vsix"
```

`--no-dependencies` is safe and correct: there are no runtime `dependencies` (everything is `devDependencies`), and it stops `vsce` from inspecting/bundling them.

**5. Known gotchas to verify during packaging:**

- **`"type": "module"`** — the manifest is an ESM package. Themes execute no JS, so this is cosmetic, but older `vsce` versions warned. `@vscode/vsce ^3` handles it; confirm no error.
- **Icon size** — `assets/icon.png` should be a reasonable square (128×128 recommended for store listings). The root `icon.png` is 1.6 MB; ensure `package.json:icon` points at `assets/icon.png` (it does) and the root one is `.vscodeignore`d.
- **Relative README image links** — `vsce` rewrites relative links using the `repository` field. Phase 0 must be done first or links resolve to the wrong owner. The current README embeds no images, so low risk, but verify after the Phase 4 README rewrite if screenshots are added.
- **`engines.vscode: ^1.85.0`** — `vsce` validates the manifest engine is satisfiable; fine as-is.

**Verification:**

```bash
npm run build          # ensure dist/RadicalReborn.json is current
npm run package        # produces radical-reborn.vsix
unzip -l radical-reborn.vsix   # confirm: NO theme/, tests/, node_modules/, root icon.png
code --install-extension radical-reborn.vsix
# Reload VSCode → Cmd/Ctrl-K Cmd/Ctrl-T → pick "Radical Reborn"
```

**Success criteria:**
- `.vsix` is < ~200 KB (just JSON + metadata + small icon), not multi-MB.
- `unzip -l` shows only `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, `dist/RadicalReborn.json`, `assets/icon.png` (+ vsce's `[Content_Types].xml` / `extension.vsixmanifest`).
- Theme applies correctly from a clean VSCode profile installed via the `.vsix`.

**Effort:** ~1–2 hours including clean-profile verification.

---

### Phase 2 — Open VSX publish

Open VSX (open-vsx.org) is the vendor-neutral registry. One-time account + namespace setup, then a per-release `ovsx publish`.

**One-time setup (manual, user-credentialed):**

1. Sign in to https://open-vsx.org with GitHub.
2. **Sign the Eclipse Foundation Publisher Agreement** — *this is the #1 cause of first-publish failures.* `ovsx publish` rejects with "must sign Publisher Agreement" until done. (Open VSX is an Eclipse project.)
3. Generate an access token at https://open-vsx.org/user-settings/tokens.
4. Create the namespace (must equal the `publisher` field from Phase 1):
   ```bash
   npx ovsx create-namespace aquaoctet -p <OPEN_VSX_TOKEN>
   ```

**Per-release publish:**

```bash
npm run build
npm run package
npx ovsx publish radical-reborn.vsix -p <OPEN_VSX_TOKEN>
```

Keep the token out of the repo — pass via env (`OVSX_PAT`) or paste at publish time. `ovsx` reads `OVSX_PAT` if `-p` is omitted.

**Success criteria:**
- `https://open-vsx.org/extension/aquaoctet/radical-reborn` resolves and shows v0.1.0.
- Installable in VSCodium / Cursor via the extensions panel (search "Radical Reborn").
- README and icon render on the listing page.

**Effort:** ~1 hour (mostly the one-time Eclipse agreement + token dance).

---

### Phase 3 — Zed registry submission

The release runbook (`docs/runbooks/release.md`) already documents this in full and was verified against real registry PRs during the origin plan's research. This phase is **execution + the Phase 0 URL fix**, not new design.

**Prerequisites:**
- Phase 0 complete: `AquaOctet/radical-reborn` is **public**, metadata and runbook URLs corrected.
- `themes/radical-reborn.json` validates: `npm run validate` (already green in CI).
- The maintainer can already manually import into Zed (confirmed) — so the Dev Extension path and rendering are validated. *(Rust toolchain is only needed for the local Dev Extension install of language extensions; a pure theme extension does not require it for registry submission.)*

**Steps (condensed from the runbook):**

1. Tag and push the release on `AquaOctet/radical-reborn`:
   ```bash
   git tag v0.1.0
   git push origin main v0.1.0
   ```
2. Fork `https://github.com/zed-industries/extensions`, clone the fork.
3. Add the submodule with the **HTTPS** URL (SSH is rejected by registry CI):
   ```bash
   git submodule add https://github.com/AquaOctet/radical-reborn extensions/radical-reborn-theme
   cd extensions/radical-reborn-theme && git checkout v0.1.0 && cd ../..
   ```
4. Add to top-level `extensions.toml` (alphabetical):
   ```toml
   [radical-reborn-theme]
   submodule = "extensions/radical-reborn-theme"
   version = "0.1.0"
   ```
5. Normalize ordering (CI checks idempotence): `pnpm sort-extensions`
6. Commit, push, open PR against `zed-industries/extensions:main`. Include the `assets/zed-preview.png` screenshot (add in Phase 4) in the PR body.

**Success criteria:**
- Submodule URL is HTTPS; `extensions.toml` is sorted; theme JSON passes the v0.2.0 schema check on registry CI.
- PR auto-merges on green (~12–24 h for new submissions per the runbook's observed timing).
- "Radical Reborn" installs from the Zed Extensions panel and matches the manual-import rendering.

**Effort:** ~1–2 hours of execution + waiting on registry CI.

---

### Phase 4 — Docs, runbooks, learnings

- **README.md** — replace the "VSCode (sideload — not on the Marketplace)" section with three install paths:
  1. **Open VSX** (search "Radical Reborn" in VSCodium/Cursor, or `Extensions: Install from VSIX`).
  2. **`.vsix` download** (from a GitHub Release: `code --install-extension radical-reborn-0.1.0.vsix`).
  3. **Build from source** (keep the existing clone/build flow for contributors, drop the symlink-as-primary framing).
  Update the Zed section from "Phase 4+" to the live registry link once merged.
- **`docs/runbooks/release.md`** — add a **VSCode distribution** section to the existing Zed-focused runbook:
  - After step 2 (build), add: `npm run package` → verify `.vsix` contents → attach `.vsix` to the GitHub Release → `npm run publish:ovsx`.
  - Note the Eclipse Publisher Agreement is one-time.
- **GitHub Release** — attach the `.vsix` to the `v0.1.0` release so the README download link is real.
- **`docs/solutions/`** (currently absent — create it) — capture two learnings:
  - `vsce` requires a `publisher` field and a `.vscodeignore` even for an unpublished `.vsix`; without the latter the whole source tree ships.
  - Open VSX rejects publishing until the Eclipse Publisher Agreement is signed.

**Effort:** ~1 hour.

---

## System-Wide Impact

- **Interaction graph:** unchanged build pipeline. New leaf steps only: `vsce package` reads `package.json` + `.vscodeignore` + `dist/RadicalReborn.json` → `.vsix`; `ovsx publish` uploads that `.vsix`; the Zed submodule pins a git tag. None feed back into `theme/`.
- **Error propagation:** packaging/publish failures are terminal CLI errors at release time, not build-time — they can't corrupt `dist/` or `themes/`. The `Promise.allSettled` build gate is untouched.
- **State lifecycle risks:** the `.vsix` is a disposable artifact (gitignore it: add `*.vsix` to `.gitignore`). The only durable new state is the `publisher` field, the GitHub tag, and the registry submodule pin. Version drift across the three channels (vsix/Open VSX/Zed) is prevented by all three consuming `package.json:version`.
- **API surface parity:** three distribution surfaces now expose the same `package.json:version`. The release runbook must bump once and ship all three from that single bump — call this out explicitly so a future release doesn't update Zed but forget Open VSX.

## Acceptance Criteria

### Functional
- [ ] No `DomPolizzi` references remain outside `docs/plans/`; `git remote` is HTTPS to `AquaOctet/radical-reborn`.
- [ ] `package.json` has `publisher: "aquaoctet"`; `@vscode/vsce` and `ovsx` in devDependencies; `package` + `publish:ovsx` scripts added.
- [ ] `.vscodeignore` excludes source/tests/docs/node_modules/root-icon; keeps `dist/RadicalReborn.json` + `assets/icon.png`.
- [ ] `npm run package` produces a `.vsix` < ~200 KB containing only runtime + store-metadata files.
- [ ] `.vsix` installs in VSCode from a clean profile and the theme applies.
- [ ] Extension live on Open VSX at `aquaoctet/radical-reborn`, installable in VSCodium/Cursor.
- [ ] `v0.1.0` tagged and pushed; `.vsix` attached to the GitHub Release.
- [ ] Submodule PR to `zed-industries/extensions` opened with HTTPS URL + sorted `extensions.toml`; merges green.
- [ ] "Radical Reborn" installable from the Zed Extensions panel.

### Non-Functional / Quality
- [ ] `*.vsix` added to `.gitignore`.
- [ ] README documents all three install paths; Zed section links the live registry entry.
- [ ] `release.md` covers vsix + Open VSX alongside Zed; one version bump ships all three.
- [ ] `docs/solutions/` captures the vsce-`.vscodeignore` and Open-VSX-agreement gotchas.

## Dependencies & Prerequisites

- **Accounts:** GitHub (have); Eclipse Foundation / Open VSX account + signed Publisher Agreement + token; a Zed-extensions fork. **No** Azure DevOps / Microsoft Marketplace account (deliberately out of scope).
- **Public repo:** `AquaOctet/radical-reborn` must be public before Phase 3.
- **Toolchain:** Node 22 + npm (note: not present in the current sandbox — packaging/publish steps run on the maintainer's machine or CI). `pnpm` is needed only inside the `zed-industries/extensions` fork for `sort-extensions`.

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| `.vsix` bloats with source tree / node_modules | High without action | Medium | `.vscodeignore` + `unzip -l` verification gate (Phase 1). |
| Open VSX publish blocked by unsigned Eclipse agreement | **High (first time)** | Low | Documented as the first one-time step; sign before `ovsx publish`. |
| Zed submodule URL still SSH or pointing at DomPolizzi | Medium | High | Phase 0 reconciliation + runbook fix; registry CI rejects SSH anyway. |
| Repo still private when registry CI clones | Medium | High | Phase 0 prerequisite check: confirm public before tagging. |
| `publisher` field ≠ Open VSX namespace | Low | Medium | Single value (`aquaoctet`) used in both Phase 1 and Phase 2 create-namespace. |
| Version drift across three channels on next release | Medium | Low | Release runbook ships all three from one `package.json` bump. |
| `"type": "module"` trips an old `vsce` | Low | Low | Pin `@vscode/vsce ^3`; verify package step has no error. |

## Future Considerations

- **CI-automated publishing:** a GitHub Actions release job that, on tag push, runs `vsce package`, attaches the `.vsix` to the Release, and `ovsx publish` (token in repo secrets). Defer until the manual flow is proven once.
- **Microsoft Marketplace:** explicitly deferred (user decision). Revisit only if stock-VSCode discoverability becomes a goal — requires an Azure DevOps publisher.
- **Screenshot/preview asset:** `assets/zed-preview.png` for the Zed PR body and README (origin plan Phase 5 item, still outstanding).

## Sources & References

### Origin
- **Origin document:** [`docs/plans/2026-05-08-001-feat-radical-reborn-zed-port-plan.md`](2026-05-08-001-feat-radical-reborn-zed-port-plan.md) — carries forward: single-source dual-target build is shipped; Zed release runbook already written and validated against real registry PRs; MIT license + flat-root layout + HTTPS-submodule requirements established.

### Internal
- `docs/runbooks/release.md` — Zed submission flow (extend with VSCode steps in Phase 4).
- `package.json` — add `publisher`, scripts, devDeps.
- `theme/build-all.ts` — renders `extension.toml`; unchanged.
- `README.md:18-38` — install section to rewrite.

### External
- [`@vscode/vsce` packaging docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [`.vscodeignore` reference](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#advanced-usage)
- [Open VSX publishing guide](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions) + [`ovsx` CLI](https://www.npmjs.com/package/ovsx)
- [Eclipse Publisher Agreement](https://open-vsx.org/user-settings/extensions)
- [`zed-industries/extensions` registry](https://github.com/zed-industries/extensions)
- [Zed theme schema v0.2.0](https://zed.dev/schema/themes/v0.2.0.json)
