# Changelog

All notable changes to **Radical Reborn** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The upstream "Radical" changelog (Dan Hedgecock, 2018-2022) is preserved at [docs/upstream-CHANGELOG.md](./docs/upstream-CHANGELOG.md).

## [0.1.0] - 2026-05-08

### Added

- Initial fork release. Rebranded from `radical-vscode` to **Radical Reborn**.
- New three-tier source layout: `theme/palette.ts` (primitive palette) and `theme/semantic.ts` (semantic mapping) split from former `theme/colors.ts`. Workbench, tokens, and language overrides relocated under `theme/vscode/` to make room for a Zed adapter alongside.
- Build now emits `dist/RadicalReborn.json`.
- License switched from ISC to MIT (Zed Extensions registry no longer accepts ISC).

### Changed

- `package.json` rebranded: `name`, `displayName`, `description`, `version` reset to `0.1.0`, `engines.vscode` bumped to `^1.85.0`.
- iTerm companion file renamed `Radical.itermcolors` → `RadicalReborn.itermcolors`. The legacy `HeckaRad.itermcolors` was removed (out of scope for ongoing maintenance).

### Acknowledgements

- Original "Radical" theme by [Dan Hedgecock](https://github.com/DHedgecock). Palette and design philosophy preserved.
