#!/usr/bin/env bash
#
# submit-to-registry.sh — automate the Zed Extensions registry submission flow
# as far as we can without forking the registry repo on the user's behalf.
#
# Reads version from this repo's package.json and assumes:
#   - This repo is at https://github.com/<owner>/<repo>
#   - You have already forked github.com/zed-industries/extensions to your account
#
# What this does:
#   1. Sanity-checks the local build state (lint, build, validate, tests)
#   2. Tags v<VERSION> if not already tagged
#   3. Clones (or refreshes) your fork of zed-industries/extensions to ../zed-extensions
#   4. Adds (or updates) the radical-reborn-theme submodule
#   5. Edits extensions.toml to add/bump the version entry
#   6. Runs `pnpm sort-extensions` for registry CI idempotence
#   7. Commits the change to a fresh branch and pushes
#
# What's left for you:
#   - `gh auth login` (or open the URL printed at the end and click "Compare & pull request")
#   - Click merge once registry CI passes (~12-24h for first publish)
#
# Usage:
#   scripts/submit-to-registry.sh <your-github-username>
# e.g.
#   scripts/submit-to-registry.sh DomPolizzi

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <your-github-username>" >&2
  exit 64
fi

GH_USER="$1"
REPO_ROOT="$(git rev-parse --show-toplevel)"
VERSION=$(node -e "console.log(require('./package.json').version)")
EXTENSION_ID="radical-reborn-theme"
THEME_REPO_URL="https://github.com/${GH_USER}/$(basename "$REPO_ROOT")"
EXTENSIONS_FORK_URL="https://github.com/${GH_USER}/extensions"
EXTENSIONS_DIR="${REPO_ROOT}/../zed-extensions"
BRANCH="add-${EXTENSION_ID}-v${VERSION}"

echo "==> Submitting ${EXTENSION_ID} v${VERSION} to zed-industries/extensions"
echo "    theme repo:           ${THEME_REPO_URL}"
echo "    extensions fork:      ${EXTENSIONS_FORK_URL}"
echo "    working clone:        ${EXTENSIONS_DIR}"
echo "    submission branch:    ${BRANCH}"
echo

cd "$REPO_ROOT"

echo "==> Pre-flight: lint / typecheck / build / validate / contrast / tests"
npm run lint
npm run typecheck
npm run build
npm run validate
npm run check:contrast
npm test

echo "==> Ensuring tag v${VERSION} exists"
if git rev-parse "v${VERSION}" >/dev/null 2>&1; then
  echo "    v${VERSION} already exists locally — skipping tag"
else
  git tag "v${VERSION}"
  echo "    tagged v${VERSION}"
fi
git push origin "v${VERSION}" 2>&1 | tail -3 || true

echo "==> Setting up local clone of your zed-industries/extensions fork"
if [[ ! -d "${EXTENSIONS_DIR}/.git" ]]; then
  git clone "${EXTENSIONS_FORK_URL}" "${EXTENSIONS_DIR}"
  cd "${EXTENSIONS_DIR}"
  git remote add upstream https://github.com/zed-industries/extensions || true
else
  cd "${EXTENSIONS_DIR}"
  git remote add upstream https://github.com/zed-industries/extensions 2>/dev/null || true
fi

echo "==> Syncing fork main with upstream"
git fetch upstream
git checkout main 2>/dev/null || git checkout -b main upstream/main
git reset --hard upstream/main

echo "==> Creating submission branch ${BRANCH}"
git checkout -B "${BRANCH}"

SUBMODULE_PATH="extensions/${EXTENSION_ID}"

if [[ -d "${SUBMODULE_PATH}" ]]; then
  echo "==> Submodule exists — bumping pin"
  ( cd "${SUBMODULE_PATH}" && git fetch origin --tags && git checkout "v${VERSION}" )
else
  echo "==> Adding new submodule"
  git submodule add "${THEME_REPO_URL}" "${SUBMODULE_PATH}"
  ( cd "${SUBMODULE_PATH}" && git checkout "v${VERSION}" )
fi

echo "==> Updating extensions.toml"
node "${REPO_ROOT}/scripts/update-registry-toml.mjs" "${EXTENSION_ID}" "${VERSION}" "${SUBMODULE_PATH}"

if command -v pnpm >/dev/null; then
  echo "==> Running pnpm sort-extensions"
  pnpm install
  pnpm sort-extensions
else
  echo "WARNING: pnpm not found. Registry CI requires sorted extensions.toml."
  echo "  Install pnpm (npm install -g pnpm) and re-run, OR sort manually."
fi

git add .
git commit -m "Add ${EXTENSION_ID} v${VERSION}" || git commit -m "Update ${EXTENSION_ID} to v${VERSION}"

echo "==> Pushing submission branch"
git push -u origin "${BRANCH}"

echo
echo "==> DONE. Last step: open the PR."
echo
echo "Either run:"
echo "  gh auth login   # one-time"
echo "  cd ${EXTENSIONS_DIR}"
echo "  gh pr create --repo zed-industries/extensions --base main --head ${GH_USER}:${BRANCH} \\"
echo "    --title \"Add ${EXTENSION_ID} v${VERSION}\" \\"
echo "    --body-file ${REPO_ROOT}/scripts/registry-pr-body.md"
echo
echo "Or open this URL in a browser:"
echo "  https://github.com/zed-industries/extensions/compare/main...${GH_USER}:${BRANCH}?expand=1"
