---
date: 2026-08-05
topic: publish-and-release-automation
---

# Publish Radical Reborn + Automate Releases

## Problem Frame

The theme is fully built and quality-gated (dual-target build, APCA gates, schema validation, snapshot tests, CI) but has **never been distributed**: zero git tags, no GitHub Release, not on Open VSX, not in the Zed extensions registry. The June 2026 publish plan (`docs/plans/2026-06-09-001`) landed all the in-repo prep (packaging scripts, `.vscodeignore`, runbooks) but the execution phases were never run. Today the only install paths are clone-and-symlink (VSCode) or manual import (Zed).

Goal: polish the theme, ship v0.1.0 to real registries, and make every future release a single tag push.

## Requirements

**Pre-publish polish (blocks v0.1.0 tag):**

- R1. Visual polish pass — resolve the `assets/TODO` items in both targets: scrollbar colors match the line-highlight family or a lavender shade (no more brownish), types rendered lavender, type assertions ultraviolet. APCA gates stay green (new exemptions need written justification).
- R2. Recommended-settings UX — the copy-paste Zed settings snippet (`examples/zed-settings.jsonc`) is polished and surfaced prominently in the README, including the overrides section the TODO calls for.
- R3. Theme JSON audit — generated Zed and VSCode outputs audited against current schemas: no redundant or deprecated keys, and every schema key added/changed since the port is either adopted or consciously skipped, with the disposition noted in the audit output. Fixes land in the build pipeline (`theme/`), never hand-edited into `dist/`/`themes/`, and use existing palette values only.

**Distribution (v0.1.0, executed via the existing runbook):**

- R4. Zed registry — "Radical Reborn" installable from Zed's Extensions panel: submodule PR to `zed-industries/extensions` pinned at `v0.1.0`, merged green.
- R5. Open VSX — live at `open-vsx.org/extension/aquaoctet/radical-reborn`, search-installable in VSCodium/Cursor/Windsurf; README + icon render correctly on the listing.
- R6. GitHub Release — `v0.1.0` release with the `.vsix` attached; README rewritten to lead with the three real install paths (Zed panel, Open VSX search, `.vsix` download) and demote build-from-source to a contributor note.

**Release automation (proven by first post-v0.1.0 release):**

- R7. Tag-push pipeline — pushing a version tag runs GitHub Actions that: build + run all gates, package the `.vsix`, create the GitHub Release with the `.vsix` attached, publish to Open VSX, and open the version-bump PR to `zed-industries/extensions`. The only manual per-release work left is the version bump + CHANGELOG commit and the tag push (and Zed's side merging the PR).
- R8. Runbook alignment — `docs/runbooks/release.md` rewritten around the automated flow, keeping the manual steps as a documented fallback.

## Success Criteria

- A user with stock Zed installs the theme from the Extensions panel by searching "Radical Reborn"; a VSCodium user does the same via their extensions search.
- The first release after v0.1.0 ships end-to-end from one `git push origin v0.1.x` — no local packaging, no manual uploads.
- APCA report shows no new non-exempt failures after the polish pass, and the maintainer signs off on the R1 color changes in a side-by-side check against the current build.

## Scope Boundaries

- **No Microsoft Marketplace** (reconfirmed 2026-08-05). Stock VSCode users use the `.vsix` from the GitHub Release. Revisit only if stock-VSCode discoverability becomes a goal.
- **No palette redesign** — R1 is targeted fixes to named TODO items, not a re-theming.
- **No build-pipeline rearchitecture** — R3 fixes flow through the existing adapters.
- **First Zed submission is manual** — the initial submodule-add PR is structurally different from version bumps; automation (R7) covers subsequent bump PRs only.

## Key Decisions

- **Polish before publish**: R1–R3 land before tagging v0.1.0 — the first impression on both registries is the polished version.
- **Full automation on tag push** (over semi-auto or manual): publish tokens live in repo secrets; per-release friction drops to one command. Chosen explicitly over keeping tokens out of the repo.
- **v0.1.0 ships via the manual runbook; automation takes over at v0.1.1**: the one-time setup (Eclipse agreement, Open VSX namespace, Zed fork, first submodule PR) is human-credentialed and easier to debug by hand; the pipeline then handles the structurally-repeatable part.
- **Skip MS Marketplace**: avoids an Azure DevOps publisher account + extra secret; Open VSX covers the VSCodium-family editors the user cares about.

## Dependencies / Assumptions

- `AquaOctet/radical-reborn` is public ✓ (verified 2026-08-05); all metadata already points at AquaOctet.
- Maintainer-machine prerequisites before executing: fix stale local remote (`git remote set-url origin https://github.com/AquaOctet/radical-reborn` — currently SSH → DomPolizzi), authenticate `gh` CLI.
- One-time accounts: Open VSX sign-in + **Eclipse Publisher Agreement** + token + `aquaoctet` namespace; fork of `zed-industries/extensions`.
- Repo secrets needed for R7: Open VSX token, plus a PAT capable of pushing to the extensions fork / opening the registry PR.

## Outstanding Questions

### Resolve Before Planning

(none)

### Deferred to Planning

- [Affects R7][Needs research] Mechanism for auto-opening the Zed version-bump PR: community action (e.g. `huacnlee/zed-extension-action`) vs. a small `gh`-scripted job. Evaluate maintenance and PAT-scope tradeoffs.
- [Affects R3][Needs research] Is Zed's theme schema still v0.2.0, and have new style keys landed since the port? Same check for VSCode `workbench.colorCustomizations` keys worth covering.
- [Affects R1][Technical] Exact lavender/ultraviolet values — choose from/extend the existing palette (`theme/palette.ts`) under the APCA gates rather than inventing ad-hoc hexes.
- [Affects R7][Technical] Whether the release workflow re-runs the full gate suite or trusts the CI run on the tagged commit; and how it guards against tag/`package.json` version mismatch.
- [Affects R7][Technical] Partial-failure handling across the three channels: ordering so the pipeline fails closed (no channel publishes if gates fail), and whether a failed run can be safely re-run without duplicate releases/publishes.

## Next Steps

→ `/ce:plan` for structured implementation planning
