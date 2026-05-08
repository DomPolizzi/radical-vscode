import { describe, expect, it } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'

/**
 * Pin the build outputs so palette refactors can't silently shift hex
 * values. Snapshot files live in tests/__snapshots__/. Update with
 * `npx vitest run -u` and review the diff in PR.
 */
const root = process.cwd()

describe('build output snapshots', () => {
  it('dist/RadicalReborn.json is stable', async () => {
    const json = await fs.readFile(path.resolve(root, 'dist/RadicalReborn.json'), 'utf8')
    expect(json).toMatchSnapshot()
  })

  it('themes/radical-reborn.json is stable', async () => {
    const json = await fs.readFile(path.resolve(root, 'themes/radical-reborn.json'), 'utf8')
    expect(json).toMatchSnapshot()
  })
})
