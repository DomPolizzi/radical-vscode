---
title: Open VSX rejects publishing until the Eclipse Publisher Agreement is signed
date: 2026-06-09
tags: [open-vsx, ovsx, publishing, vscode, distribution]
component: publishing
---

## Problem

`ovsx publish` fails on a first attempt even with a valid access token. The error is about the publisher not having signed the agreement — not an obvious token or namespace problem. It's easy to misread as a credentials issue and burn time regenerating tokens.

## Solution

Open VSX is an Eclipse Foundation project. Before *any* publish you must, **once**:

1. Sign in at https://open-vsx.org with GitHub.
2. **Sign the Eclipse Foundation Publisher Agreement** (in account settings). This is the step that's easy to miss.
3. Generate an access token at https://open-vsx.org/user-settings/tokens.
4. Create the namespace, which must equal `package.json:publisher`:
   ```bash
   npx ovsx create-namespace aquaoctet -p <OPEN_VSX_TOKEN>
   ```

Then each release:
```bash
OVSX_PAT=<OPEN_VSX_TOKEN> npm run publish:ovsx
```

## Why this matters

This is the single most common first-publish failure for Open VSX. Knowing it's an agreement-signing prerequisite (not a token bug) saves a debugging detour. The namespace ↔ `publisher` equality is also load-bearing: a mismatch silently blocks publishing.

## Related

- The `.vsix` being published is built per [[2026-06-09-vsce-requires-vscodeignore]].
- Full release flow: `docs/runbooks/release.md` §6.
