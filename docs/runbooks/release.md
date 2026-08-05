# Release runbook — Radical Reborn

Ships every version to all three channels — the **Zed Extensions registry**, **Open VSX** (VSCodium/Cursor/Windsurf), and a **`.vsix`** on the GitHub Release — from one `package.json` version bump. Never bump channels independently.

**The pipeline does the publishing.** Pushing an annotated `v*` tag runs `.github/workflows/release.yml`: gates → `.vsix` → GitHub Release → Open VSX publish + Zed version-bump PR. Per-release manual work is exactly: **bump + CHANGELOG + annotated tag push**, then watch the run. The [manual fallback](#8-manual-fallback) exists for pipeline outages.

## One-time setup (before the first automated release)

- [ ] **Open VSX**: sign in at open-vsx.org with GitHub → sign the **Eclipse Publisher Agreement** (unsigned, `ovsx publish` fails with what looks like a token error — `docs/solutions/2026-06-09-openvsx-publisher-agreement.md`) → create a local token and a separate CI token → create the namespace **without putting the token in argv/shell history**: `OVSX_PAT=<token> npx ovsx create-namespace aquaoctet`. Optional: file the EclipseFdn ownership claim to clear the "unverified" badge.
- [ ] **Machine account** (`aquaoctet-bot` — if named differently, update `push-to:` in both workflow files): create it, fork `zed-industries/extensions` under it, sign Zed's CLA with it. The human maintainer signs the CLA separately (author of the first-submission PR). Its classic PAT (`repo` + `workflow` scopes, 90-day expiry) becomes `COMMITTER_TOKEN`. **Never mint this PAT on the maintainer account** — a maintainer-account PAT could rewrite this repo's own pipeline; the machine account's blast radius is one disposable fork.
- [ ] **Secrets**: GitHub Environment named `release` with deployment tag rule `v*`; add `OVSX_PAT` (CI token) and `COMMITTER_TOKEN` there — not as repo-wide secrets.
- [ ] **Immutable releases**: enable in repo settings (closes asset-swap-after-publish on the channel the README sends VSCode users to).
- [ ] Actions failure emails enabled (github.com/settings/notifications → Actions); Watching this repo (at least Issues).
- [ ] Record both token expiry dates here + calendar reminders: `OVSX_PAT` expires ______ · `COMMITTER_TOKEN` expires ______.

## Pre-flight (Go/No-Go — any failed line is a No-Go)

```bash
git remote get-url origin                    # AquaOctet/radical-reborn (SSH or HTTPS)
gh auth status && git push --dry-run origin main
git status --porcelain                       # clean
git tag -l "v<NEW VERSION>"; git ls-remote --tags origin "v<NEW VERSION>"   # both empty (burn-version policy)
gh api "repos/AquaOctet/radical-reborn/commits/$(git rev-parse HEAD)/check-runs" \
  --jq '.check_runs[] | [.name,.conclusion] | @tsv'                          # all success

# Guard replica (the pipeline re-checks these; failing THERE burns the version)
V=<NEW VERSION>; [ "$(node -p "require('./package.json').version")" = "$V" ] \
  && grep -q "version = \"$V\"" extension.toml \
  && grep -q "^## \[$V\]" CHANGELOG.md && echo GUARDS-OK

# Split-brain + package dry-run BEFORE tagging (catches .vscodeignore drift tag-free)
npm run build && npm run check:contrast && npm run check:drift
npm run package && unzip -Z1 radical-reborn.vsix | LC_ALL=C sort | diff -u .github/vsix-manifest.txt -

# Publish-precondition proofs (no publishing happens)
curl -s -o /dev/null -w '%{http_code}\n' https://open-vsx.org/api/aquaoctet   # 200
npx ovsx verify-pat aquaoctet                # with OVSX_PAT in env — proves token + agreement
curl -sI -H "Authorization: token $COMMITTER_TOKEN" https://api.github.com/user | grep -i x-oauth-scopes
#   must list repo, workflow — header ABSENT means fine-grained PAT = wrong type
```

## 1. Bump the version

```bash
npm version <patch|minor|major> --no-git-tag-version
```

`package.json:version` is the single source of truth; the build propagates it into `extension.toml`.

## 2. Update the CHANGELOG

Add `## [<NEW VERSION>] - YYYY-MM-DD` at the top with Added/Changed/Fixed. The pipeline's release notes come from the **annotated tag message** — step 4 copies this section into it.

## 3. Rebuild + run the gates locally

```bash
npm run build && npm run lint && npm run typecheck
npm run check:contrast        # writes dist/apca-report.txt (build does NOT)
npm run check:drift           # committed artifacts == fresh build
npm run validate && npm test
```

If snapshots changed intentionally: `npx vitest run -u`, review the diff carefully (every color change surfaces there), `git add tests/__snapshots__/`.

## 4. Commit, tag (annotated!), push

```bash
git add package.json package-lock.json extension.toml dist/ themes/ tests/__snapshots__/ CHANGELOG.md
git commit -m "release: v<NEW VERSION>"
git push origin main                          # tag must land on main BEFORE the tag push
git tag -a "v<NEW VERSION>" --cleanup=verbatim -m "<paste the CHANGELOG section>"
# --cleanup=verbatim: without it git strips the markdown "###" headers as comments
git for-each-ref refs/tags/v<NEW VERSION> --format='%(objecttype)'   # must print: tag (annotated)
git push origin "v<NEW VERSION>"              # ← this fires the release pipeline
```

Push **one tag at a time** — the pipeline's concurrency group keeps only one pending run; a second queued release silently replaces the first (re-run any release that shows "canceled").

## 5. Watch the release (this is the entire monitoring plan)

| When | Do |
| --- | --- |
| **T+0** | `gh run watch $(gh run list --workflow release.yml -L1 --json databaseId -q '.[0].databaseId') --exit-status` — the only synchronous window is the one you hold open. |
| **T+1h** | Zed bump PR merged by `zed-zippy[bot]` (`gh pr list -R zed-industries/extensions --search "radical-reborn-theme" --state all -L1`) — load-bearing check: the machine account's PR notifications land where nobody reads. Then the consistency one-liner below. |
| **T+24h** | Open VSX listing renders (README/icon): https://open-vsx.org/extension/aquaoctet/radical-reborn — no webhooks exist; this curl/eyeball IS the monitoring. Skim repo issues. |

```bash
# Version consistency across all three channels vs local
V=$(node -p "require('./package.json').version"); \
GH=$(gh release view "v$V" --json tagName -q .tagName 2>/dev/null); \
OV=$(curl -sf https://open-vsx.org/api/aquaoctet/radical-reborn | jq -r .version); \
ZED=$(curl -sf https://raw.githubusercontent.com/zed-industries/extensions/main/extensions.toml | grep -A3 '^\[radical-reborn-theme\]' | grep -m1 version | sed 's/.*"\(.*\)"/\1/'); \
echo "local=$V gh=${GH#v} ovsx=$OV zed=$ZED"
```

## 6. First-time Zed submission (manual — once, before automation covers Zed)

The registry indexes themes as a git **submodule pointer + version**; the bump automation edits an *existing* entry and hard-fails on a missing one, so the first submission is by hand:

```bash
git clone https://github.com/aquaoctet-bot/extensions zed-extensions && cd zed-extensions
git remote add upstream https://github.com/zed-industries/extensions
git fetch upstream && git checkout -b add-radical-reborn-theme upstream/main
git submodule add https://github.com/AquaOctet/radical-reborn extensions/radical-reborn-theme
cd extensions/radical-reborn-theme && git checkout "v<VERSION>" && cd ../..
$EDITOR extensions.toml     # [radical-reborn-theme] / submodule = ... / version = "<VERSION>"
pnpm sort-extensions        # registry CI requires normalized ordering
git add . && git commit -m "Add radical-reborn-theme v<VERSION>" && git push origin HEAD
```

Open the PR against `zed-industries/extensions:main`. **Submodule URL must be HTTPS** (SSH is rejected) and the pinned commit must be on a branch. Expectations: the CLA check must go green, and **new-extension PRs are human-merged — days to weeks** (observed: one submission took ~4 months). Only *version bumps* auto-merge, via `zed-zippy[bot]` (~25 min observed). While the PR is open, add a "pending registry review" note to the README's Zed section; remove it at merge.

## 7. Failure policies

| Situation | Policy |
| --- | --- |
| Gates fail on the pushed tag | **Burn the version.** Fix forward, bump patch, new tag. Never move or delete a pushed `v*` tag — the rollback flow depends on tags as records. |
| Partial publish (some channels red) | "Re-run failed jobs." Every channel step is idempotent: flake-safe release create, `ovsx --skip-duplicate`, 3-state Zed guard. |
| Re-run unavailable (>30 days) or artifact expired (>90 days) | Fall back to the [manual flow](#8-manual-fallback) for the missing channel(s); for Zed use the **"Zed bump (manual)"** workflow dispatch. |
| Zed job skipped (extension not in registry yet) | Expected until the first-submission PR merges — then dispatch "Zed bump (manual)" with the latest tag. |
| Queued release run shows "canceled" | Concurrency replacement — re-run it after the active release finishes. |
| Broken version shipped | `docs/runbooks/rollback.md`. |

## 8. Manual fallback

Same artifacts, by hand — only when the pipeline is unavailable:

```bash
npm run build && npm run check:contrast && npm run check:drift && npm test && npm run validate
npm run package && unzip -Z1 radical-reborn.vsix | LC_ALL=C sort | diff -u .github/vsix-manifest.txt -
gh release create "v<VERSION>" radical-reborn.vsix --verify-tag --notes-from-tag
OVSX_PAT=<local token> npm run publish:ovsx -- --skip-duplicate
# Zed: dispatch "Zed bump (manual)" with the tag, or the fork flow from section 6
```

## 9. Credential rotation & compromise

- **Rotation** (before expiry): mint the replacement (CI-scoped `OVSX_PAT` at open-vsx.org token settings; machine-account classic PAT `repo`+`workflow` for `COMMITTER_TOKEN`), update the `release` Environment secret, update the expiry dates above.
- **Compromise**: revoke at open-vsx.org/user-settings/tokens and the machine account's PAT settings immediately. Open VSX has **no self-serve unpublish** — if a malicious version shipped, contact Open VSX admins and publish a fixed higher version. Audit the fork (`aquaoctet-bot/extensions`) for unexpected branches/PRs.
- Tool-version bumps (`@vscode/vsce`, `ovsx` exact pins in `package.json` scripts) happen only via reviewed PR — Dependabot does not track npx pins.

## Common rejections from Zed registry CI

| Cause | Fix |
| --- | --- |
| Submodule URL is SSH (`git@github.com:...`) | HTTPS only — `git submodule set-url` |
| `extensions.toml` not sorted | `pnpm sort-extensions` before committing |
| Theme JSON fails schema validation | `npm run validate` locally; `$schema` URL must be exact |
| LICENSE unrecognized | `LICENSE` (no extension) at repo root, valid SPDX text (MIT ✓) |
| Version mismatch extensions.toml ↔ extension.toml | The pipeline's dual-manifest guard prevents this; manual PRs: re-check both |
| Duplicate id | Coordinate with the existing owner or pick a new id |
