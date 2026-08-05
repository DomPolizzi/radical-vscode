# Rollback runbook — Radical Reborn

When a published Zed Extensions version is broken (renders incorrectly, schema invalidates, contrast regression that shipped) — there's no "yank" mechanism in the registry. Rollback = ship a downgrade PR.

## Decision matrix

| Signal | Action |
| --- | --- |
| Local-only build is broken | Don't release — fix on a branch |
| Registry version installed but cosmetic issue | Open a hotfix PR, ship as next patch version (don't downgrade) |
| Registry version installed and unusable (no syntax highlighting, blank panels, etc.) | Downgrade — see below |
| Registry version causes Zed to crash | Downgrade immediately, then triage |
| "Font not applied / looks fuzzy" reports | **Not a release defect** — user-side config (`docs/solutions/2026-06-09-zed-font-not-applied-not-installed.md`); point at the README font section, never roll back |

Downgrade PRs are **human-reviewed** — prefix the title `Rollback: ` and expect hours-to-days (only routine version *bumps* auto-merge via `zed-zippy[bot]`, ~25 min observed). If the issue is hours-fresh, an immediate hotfix patch through the normal tag-push pipeline usually beats a downgrade.

## Downgrade flow

**Primary path:** dispatch the **"Zed bump (manual)"** workflow (Actions tab) with the last-good tag — it opens the downgrade PR with the same guard + action the release pipeline uses. Then comment/retitle the PR with the `Rollback: ` prefix by hand (the action templates its own title).

```bash
# Identify the last known good tag in our repo
git tag --list 'v*' --sort=-v:refname | head -5
gh workflow run zed-bump-manual.yml -f tag=v<GOOD VERSION>
```

**Fallback path** (workflow unavailable) — by hand in the machine account's fork:

```bash
# In the aquaoctet-bot/extensions fork:
cd zed-extensions
git fetch upstream
git checkout -b rollback/radical-reborn-theme-to-<GOOD VERSION> upstream/main

cd extensions/radical-reborn-theme
git fetch origin
git checkout v<GOOD VERSION>
cd ../..

# Lower the version in extensions.toml
$EDITOR extensions.toml
# [radical-reborn-theme]
# version = "<GOOD VERSION>"

pnpm sort-extensions
git add .
git commit -m "Rollback radical-reborn-theme to v<GOOD VERSION>"
git push origin rollback/radical-reborn-theme-to-<GOOD VERSION>
```

Open the PR against `zed-industries/extensions:main`. Title prefix it `Rollback: ` so reviewers prioritize it.

## Local rebuild from prior tag

If you need the older version on your machine immediately while the registry catches up:

```bash
git fetch origin --tags
git checkout v<GOOD VERSION>
npm install
npm run build
# Reload VSCode / Zed
```

Return to main when done:

```bash
git checkout main
```

## Hotfix flow (preferred over downgrade for fresh releases)

When a release is < 24h old and the issue is contained:

```bash
git checkout main
git checkout -b hotfix/<short-description>
# fix the issue
npm test
npm run validate
git commit -m "fix: <description>"
git push -u origin hotfix/<short-description>
# Open PR, merge, follow release runbook with patch bump
```

The hotfix patch ships through the normal tag-push pipeline; its Zed bump PR auto-merges via `zed-zippy[bot]` (~25 min observed) — usually faster than a human-reviewed downgrade, and you avoid the version-number-going-backwards confusion that downgrades create for installed users.

## Open VSX

**There is no unpublish.** Open VSX versions are immutable and self-serve removal does not exist — the policy is **publish-fixed-version-forward**: bump patch, ship through the pipeline, the new version becomes `latest`. If the shipped version is actively malicious (compromised pipeline, not just broken), contact the Open VSX admins to request removal AND rotate credentials per `docs/runbooks/release.md` §9. Users who installed the broken version get the fix on their next update check.

## GitHub Release

- Annotate, never delete: update the broken release's notes with what failed and a link to the fix.
- Repoint the **latest** marker at the last good release so the README's "latest release" link serves a working `.vsix` while the fix builds:

```bash
gh release edit v<GOOD VERSION> --latest
# after the fixed release ships:
gh release edit v<FIXED VERSION> --latest
```

## Communication

- Update the GitHub release notes for the broken tag with a brief explanation and link to the rollback PR (see the `--latest` repoint above)
- If a user-facing channel exists (README install instructions, Discord, etc.), pin a notice
- Don't delete the broken tag — it's a record (and the downgrade flow checks out by tag). Just don't reference it from the registry.

## After rollback / hotfix

- [ ] Open a follow-up issue on the broken tag explaining what failed
- [ ] If the failure could have been caught by CI, add a regression test or new gate
- [ ] Capture the lesson in `docs/solutions/` (institutional knowledge)
