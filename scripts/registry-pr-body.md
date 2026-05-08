## Summary

Adds **Radical Reborn** — a maintained fork of Dan Hedgecock's [Radical](https://github.com/DHedgecock/radical-vscode) theme — extended for Zed. Retro-futuristic dark palette (pink/teal/lavender/chartreuse on deep purple-black) with full coverage for modern editor surfaces: AI completion preview, parameter annotations, sticky scroll subheader, semantic tokens, and version-control decorations.

## Variant

- **Radical Reborn** (dark)

## Test plan

- [x] Theme JSON validates against `https://zed.dev/schema/themes/v0.2.0.json`
- [x] Installs cleanly via Zed Dev Extension and renders correctly across editor, panels, terminal, AI surfaces
- [x] APCA contrast pass — gates against new low-contrast pairs
- [x] Snapshot tests pin both VSCode and Zed JSON outputs
- [x] CI green: lint + typecheck + build + validate + contrast + tests on Node 22
- [x] License: MIT (accepted SPDX identifier)

Repository: <THEME_REPO_URL>
