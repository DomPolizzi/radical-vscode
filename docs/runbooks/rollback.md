# Rollback runbook — Radical Reborn

When a published Zed Extensions version is broken (renders incorrectly, schema invalidates, contrast regression that shipped) — there's no "yank" mechanism in the registry. Rollback = ship a downgrade PR.

## Decision matrix

| Signal | Action |
| --- | --- |
| Local-only build is broken | Don't release — fix on a branch |
| Registry version installed but cosmetic issue | Open a hotfix PR, ship as next patch version (don't downgrade) |
| Registry version installed and unusable (no syntax highlighting, blank panels, etc.) | Downgrade — see below |
| Registry version causes Zed to crash | Downgrade immediately, then triage |

Downgrading takes the same ~12-24h as a forward release. If the issue is hours-fresh, an immediate hotfix PR usually beats a downgrade.

## Downgrade flow

```bash
# Identify the last known good tag in our repo
git tag --list 'v*' --sort=-v:refname | head -5
# Pick the previous version (e.g. v0.1.0)

# In your zed-industries/extensions fork:
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

The hotfix patch will arrive in the registry on the same ~12-24h cycle, but you avoid the version-number-going-backwards confusion that downgrades create for installed users.

## Communication

- Update the GitHub release notes for the broken tag with a brief explanation and link to the rollback PR
- If a user-facing channel exists (README install instructions, Discord, etc.), pin a notice
- Don't delete the broken tag — it's a record. Just don't reference it from the registry.

## After rollback / hotfix

- [ ] Open a follow-up issue on the broken tag explaining what failed
- [ ] If the failure could have been caught by CI, add a regression test or new gate
- [ ] Capture the lesson in `docs/solutions/` (institutional knowledge)
