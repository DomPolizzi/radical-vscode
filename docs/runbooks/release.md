# Release runbook — Radical Reborn

Single source of truth for shipping a new version to the **Zed Extensions registry**. The VSCode build is sideload-only and ships locally with each git checkout — no separate release.

## Pre-flight

- [ ] CI green on `main`
- [ ] All planned PRs merged
- [ ] Working tree clean (`git status`)
- [ ] On `main` and up to date (`git pull origin main`)

## 1. Bump the version

`package.json:version` is the single source of truth. The build script propagates it into `extension.toml` automatically.

```bash
npm version <patch|minor|major> --no-git-tag-version
# e.g. npm version minor   →   0.1.0 → 0.2.0
```

This updates `package.json` and `package-lock.json`. The git tag step is deferred to step 4.

## 2. Build everything

```bash
npm run build
```

Verify:

- `dist/RadicalReborn.json` updated
- `themes/radical-reborn.json` updated
- `extension.toml` rendered with the new version
- `dist/apca-report.txt` produced (no new blocking failures)

If APCA reports new non-exempt failures, **stop**. Either tweak the palette or add an exemption with justification (`theme/utils/apca-exemptions.ts`) before continuing.

## 3. Run the gates locally

```bash
npm run lint
npm run typecheck
npm run validate    # Zed schema validation
npm test            # full suite, incl. snapshots + scope coverage
```

If snapshots changed intentionally:

```bash
npx vitest run -u
git add tests/__snapshots__/
```

Review the snapshot diff carefully — any palette change shows up here.

## 4. Update the CHANGELOG

Add a new section at the top of `CHANGELOG.md`:

```markdown
## [<NEW VERSION>] - YYYY-MM-DD

### Added / Changed / Fixed
- ...
```

## 5. Commit, tag, push

```bash
git add package.json package-lock.json extension.toml dist/ themes/ tests/__snapshots__/ CHANGELOG.md
git commit -m "release: v<NEW VERSION>"
git tag "v<NEW VERSION>"
git push origin main "v<NEW VERSION>"
```

## 6. Submodule update PR to `zed-industries/extensions`

First-time setup: fork `https://github.com/zed-industries/extensions`.

```bash
# Clone your fork (one-time)
git clone https://github.com/<you>/extensions zed-extensions
cd zed-extensions
git remote add upstream https://github.com/zed-industries/extensions
```

Update flow:

```bash
cd zed-extensions
git fetch upstream
git checkout -b update/radical-reborn-theme-<NEW VERSION> upstream/main

# First publish: add submodule. Subsequent updates: bump it.
# First publish only:
git submodule add https://github.com/DomPolizzi/radical-reborn extensions/radical-reborn-theme

# Subsequent updates:
cd extensions/radical-reborn-theme
git fetch origin
git checkout v<NEW VERSION>
cd ../..

# Update top-level extensions.toml (alphabetical order)
$EDITOR extensions.toml
# Find or insert:
#   [radical-reborn-theme]
#   submodule = "extensions/radical-reborn-theme"
#   version = "<NEW VERSION>"

# Normalize sorting (registry CI requires this)
pnpm sort-extensions

git add .
git commit -m "Add radical-reborn-theme v<NEW VERSION>"   # or "Update ... to v..."
git push origin update/radical-reborn-theme-<NEW VERSION>
```

Open the PR against `zed-industries/extensions:main`. CI auto-validates and auto-merges on green within ~12-24 hours (faster for updates — observed ~25 minutes for version-bump PRs).

## 7. Verify the published extension

After the PR merges:

1. Open Zed → Extensions panel
2. Search "Radical Reborn"
3. Click Install (or Update)
4. Confirm the version number matches what shipped

If the registry build fails, the PR will reopen with a comment. Common causes:

- `extension.toml` `id` doesn't end in `-theme` (registry convention; soft requirement)
- License file unrecognized — must be MIT (we are), Apache-2.0, BSD-2/3, GPL-3.0, LGPL-3.0, CC BY 4.0, Unlicense, or zlib
- Schema validation fails — run `npm run validate` locally to confirm

## 8. Post-release

- [ ] Tag matches what's published (`git tag --list 'v*'`)
- [ ] Marketplace listing renders the README correctly
- [ ] `extension.toml` version in our repo == version in `zed-industries/extensions/extensions.toml`

## Common rejections from registry CI

| Cause | Fix |
| --- | --- |
| Submodule URL is SSH (`git@github.com:...`) | Use HTTPS only — `git submodule set-url` to update |
| `extensions.toml` not sorted | Run `pnpm sort-extensions` before committing |
| Theme JSON fails schema validation | Run `npm run validate` locally; check `$schema` URL is exact |
| LICENSE file not recognized | Ensure file is `LICENSE` (no extension) at repo root with valid SPDX-identified content |
| Duplicate id in registry | Pick a different id or coordinate with the existing owner |
