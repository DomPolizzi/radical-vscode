---
title: Generated-JSON audit — Zed + VSCode style-key dispositions (R3)
date: 2026-08-05
tags: [zed, vscode, schema, audit, theme-keys]
component: theme
---

# Generated-JSON audit — style-key dispositions

Origin requirement R3 (`docs/brainstorms/2026-08-05-publish-and-release-automation-requirements.md`): every schema key added or changed since the port is either adopted or consciously skipped, with the disposition recorded. This document is that record.

**Upstream provenance:** Zed's published theme schema (`https://zed.dev/schema/themes/v0.2.0.json`) is frozen at its 2024 shape; the engine's source of truth is `zed-industries/zed` → `crates/settings_content/src/theme.rs`, verified against `main` on **2026-08-05**. Keys this theme emits beyond the published schema are registered in `schemas/zed-v0.2.0-extended.json` and enforced by the membership + ratchet tests in `tests/schema.test.ts`. To refresh this audit later: diff `theme.rs` against this date.

**Default disposition is `skip` — editor default acceptable; revisit on user report.** A skip is a decision, not an omission. Adopting a key for a surface the maintainer has never evaluated is re-theming, which R3's scope explicitly excludes.

## Zed — adopted

| Key | Disposition | Rationale |
| --- | --- | --- |
| `minimap.thumb.background` / `.hover_background` / `.active_background` / `.border` | **Adopt** | Rides the R1 scrollbar unification — shares the `SCROLLBAR_THUMB*` consts in `theme/zed/style.ts` so the two chromes cannot drift. |
| `scrollbar.thumb.active_background` | **Adopt** | Completes the thumb state set alongside the R1 recolor. |

## Zed — already emitted, post-schema (documented, kept)

`editor.hover_line_number`, `search.active_match_background` (zed#44098), `version_control.added` / `.modified` / `.deleted`, `version_control.word_added` / `.word_deleted` (zed#43269), `version_control.conflict_marker.ours` / `.theirs` — all registered in the extended schema with per-key provenance comments.

## Zed — skipped

| Key / family | Disposition | Rationale |
| --- | --- | --- |
| `background.appearance` | Skip | In-schema but unemitted; default (opaque) is correct — blur/transparency is user taste, not theme identity. |
| `pane.focused_border` | Skip | Focus signaling already carried by `panel.focused_border` + accent borders; default acceptable. |
| `pane_group.border` | Skip | `border` / `border.variant` cover the surface; default acceptable. |
| `editor.diff_hunk.*` (zed#51784) | Skip | Falls back to `version_control.*` with opacity — the fallback renders exactly our intent; adopting would duplicate values to maintain. |
| `vim.*` mode indicators (zed#46639, #49517, #43733) | Skip (family) | Never themed; default acceptable. Revisit if vim users report clashes. |
| `debugger.accent`, `editor.debugger_active_line.background` | Skip (family) | Debugger surface never evaluated; default acceptable. |
| `element.selection_background`, `panel.overlay_background`, `panel.overlay_hover`, `drop_target.border` | Skip | Defaults acceptable; `drop_target.background` already themed. |

## Zed — deprecated (ratchet-tested)

`scrollbar_thumb.background`, `version_control.conflict_ours_background`, `version_control.conflict_theirs_background` — never emitted, and the test asserts they exist in **neither** schema file, so a future membership failure cannot be "fixed" by registering a deprecated key.

## VSCode

| Key / family | Disposition | Rationale |
| --- | --- | --- |
| `minimapSlider.background` / `.hoverBackground` / `.activeBackground` | **Adopt** | R1 — mirrors `scrollbarSlider.*` via the shared `SCROLLBAR_LAVENDER` const. |
| `editorBracketMatch.foreground` (new in 1.109) | Skip | We already signal matches via `editorBracketMatch.border`; coloring matched-bracket *text* is a new design decision. Revisit next visual pass. |
| `chat.*` (requestBubble, thinkingShimmer, linesAdded/Removed, …) | Skip (family) | Dozens of keys churning with editor releases — a per-key treadmill. Defaults acceptable. |
| `inlineEdit.*` | Skip (family) | Same churn argument; defaults acceptable. |
| `terminalSymbolIcon.*` | Skip (family) | Defaults acceptable. |

## Deliberate cross-target asymmetries

1. **Type assertions are ultraviolet in VSCode only.** Zed maps `keyword.control.as` / `asserts` / `is` to generic `keyword` / `operator` canonical keys (`theme/mappings/tm-to-canonical.ts`) — no assertion-specific key exists in Zed's syntax model; recoloring would hit every keyword.
2. **Scrollbars are outside APCA scope.** Non-text chrome (Lc 15 tier at most); the contrast gate covers text slots. Recorded here so "APCA green" is never read as covering the R1 scrollbar change.
3. **Selection color families differ.** VSCode selection is ultraviolet (`ULTRAVIOLETS[200]` @ 0.3); Zed player-0 selection stays pink (`theme/zed/players.ts`) — Zed's multiplayer selection palette is its own 8-player system, not a single-selection color.
