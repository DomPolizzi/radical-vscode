import { describe, expect, it } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { TM_TO_CANONICAL } from '../theme/mappings/tm-to-canonical.js'

/**
 * Every TM scope passed to `token()` in this codebase must appear as a
 * key in TM_TO_CANONICAL — either mapped to a canonical Zed key or
 * marked VSCODE_ONLY. Catches the case where someone adds a new scope
 * to a language file but forgets to update the mapping table.
 */

const root = process.cwd()

const SOURCE_FILES = [
  'theme/vscode/tokens.ts',
  'theme/vscode/languages/comment.ts',
  'theme/vscode/languages/go.ts',
  'theme/vscode/languages/html.ts',
  'theme/vscode/languages/javascript.ts',
  'theme/vscode/languages/json.ts',
  'theme/vscode/languages/markdown.ts',
  'theme/vscode/languages/react.ts',
  'theme/vscode/languages/yaml.ts',
]

// Match `token('scope.string', ...)` and inline `scope: 'string'` from the 4
// inline literal entries in tokens.ts. Quoted single OR double.
const TOKEN_CALL = /\btoken\(\s*['"]([^'"]+)['"]/g
const INLINE_SCOPE = /\bscope:\s*['"]([^'"]+)['"]/g

/**
 * TextMate's `,` is a selector union — the matched string can list several
 * scopes. Split and trim so the coverage check looks up individual scopes.
 */
function splitSelector(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

async function extractScopes(): Promise<Set<string>> {
  const scopes = new Set<string>()
  for (const rel of SOURCE_FILES) {
    const src = await fs.readFile(path.resolve(root, rel), 'utf8')
    for (const match of src.matchAll(TOKEN_CALL)) {
      for (const s of splitSelector(match[1])) scopes.add(s)
    }
    for (const match of src.matchAll(INLINE_SCOPE)) {
      for (const s of splitSelector(match[1])) scopes.add(s)
    }
  }
  return scopes
}

describe('TM-to-canonical scope coverage', () => {
  it('every scope used in theme/vscode/ has a mapping table entry', async () => {
    const used = await extractScopes()
    const missing: string[] = []
    for (const scope of used) {
      if (!(scope in TM_TO_CANONICAL)) missing.push(scope)
    }
    expect(missing, `Unmapped TM scopes — add to theme/mappings/tm-to-canonical.ts`).toEqual([])
  })

  it('extracts a non-empty scope set (sanity check the regex)', async () => {
    const used = await extractScopes()
    expect(used.size).toBeGreaterThan(20)
  })
})
