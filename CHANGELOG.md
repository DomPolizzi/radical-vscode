# Changelog

All notable changes to **Radical Reborn** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The upstream "Radical" changelog (Dan Hedgecock, 2018-2022) is preserved at [docs/upstream-CHANGELOG.md](./docs/upstream-CHANGELOG.md).

## [0.1.1] - 2026-08-05

### Changed

- Type assertions (`as`, `asserts`, `is`) now render in ultraviolet with bold emphasis in VSCode, replacing the hot pink that blended into other keywords.
- Scrollbar and minimap chrome moved from pink to lavender in both editors, matching the active-line highlight family.
- Terminal and editor selection unified on a single violet (previously two near-identical hexes one digit apart).

### Added

- Minimap thumb colors in Zed and minimap sliders in VSCode, sharing the scrollbar values so the two can't drift apart.
- README: overrides guide (tweak any color from settings, no fork needed) and a post-install setup pointer.
- Tag-push release pipeline: pushing a version tag builds, checks contrast, packages the `.vsix`, and publishes to the GitHub Release, Open VSX, and the Zed registry from one bump.
- Schema coverage test for the generated Zed JSON — new engine keys are adopted or skipped deliberately (see `docs/audits/`).

### Fixed

- The v0.1.0 GitHub release was published without the packaged `.vsix`; the artifact was attached retroactively and this release supersedes it.

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
