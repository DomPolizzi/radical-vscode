import { describe, expect, it } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

/**
 * Validate Zed JSON output against the pinned v0.2.0 schema. Mirrors
 * `npm run validate` so vitest catches schema regressions in tests, not
 * just in the dedicated CLI step.
 */

const root = process.cwd()

describe('Zed v0.2.0 schema', () => {
  it('themes/radical-reborn.json validates', async () => {
    const schema = JSON.parse(
      await fs.readFile(path.resolve(root, 'schemas/zed-v0.2.0.json'), 'utf8'),
    )
    const data = JSON.parse(
      await fs.readFile(path.resolve(root, 'themes/radical-reborn.json'), 'utf8'),
    )

    const ajv = new Ajv({ allErrors: true, strict: false })
    addFormats(ajv)
    const validate = ajv.compile(schema)
    const valid = validate(data)
    if (!valid) {
      // Print first 5 errors for readability
      const errs = (validate.errors ?? []).slice(0, 5).map(
        (e) => `${e.instancePath} ${e.message} ${JSON.stringify(e.params)}`,
      )
      console.error('Schema errors:\n  ' + errs.join('\n  '))
    }
    expect(valid, 'themes/radical-reborn.json must validate against v0.2.0 schema').toBe(true)
  })
})

/**
 * Emitted-key coverage. Catches the case where a typo'd or unregistered style
 * key ships silently: the published schema leaves the style object open (no
 * `additionalProperties: false`), so plain validation passes ANY key —
 * including misspellings. Every key the build emits must exist either in the
 * pinned published schema or in the extensions registry
 * (schemas/zed-v0.2.0-extended.json).
 *
 * `syntax` contents are deliberately not recursed: Zed syntax keys are
 * compile-time-gated by `Partial<Record<ZedSyntaxKey, …>>` in
 * theme/zed/syntax.ts, which is stronger than any runtime check — do not
 * "improve" this test by adding syntax recursion.
 */
describe('Zed style key coverage (published schema + extensions)', () => {
  const load = async (rel: string) =>
    JSON.parse(await fs.readFile(path.resolve(root, rel), 'utf8'))

  it('every emitted style key is a known schema key', async () => {
    const vendored = await load('schemas/zed-v0.2.0.json')
    const extended = await load('schemas/zed-v0.2.0-extended.json')
    const theme = await load('themes/radical-reborn.json')

    const known = new Set([
      ...Object.keys(vendored.definitions.ThemeStyleContent.properties),
      ...Object.keys(extended.definitions.ThemeStyleContentExtensions.properties),
    ])
    // Sanity floor — a mis-parsed subschema would make the membership check
    // vacuously green (published schema alone carries 142 style properties).
    expect(known.size).toBeGreaterThan(140)

    const emitted = Object.keys(theme.themes[0].style)
    const unknown = emitted.filter((key) => !known.has(key))
    expect(
      unknown,
      `Unknown style key(s) emitted — either a typo in theme/zed/style.ts or a new engine key missing from schemas/zed-v0.2.0-extended.json: ${unknown.join(', ')}`,
    ).toEqual([])
  })

  it('deprecated keys stay out of the output AND out of the schemas (ratchet)', async () => {
    const DEPRECATED_ZED_KEYS = [
      'scrollbar_thumb.background',
      'version_control.conflict_ours_background',
      'version_control.conflict_theirs_background',
    ]
    const vendored = await load('schemas/zed-v0.2.0.json')
    const extended = await load('schemas/zed-v0.2.0-extended.json')
    const theme = await load('themes/radical-reborn.json')

    const emitted = new Set(Object.keys(theme.themes[0].style))
    for (const key of DEPRECATED_ZED_KEYS) {
      expect(emitted.has(key), `${key} is deprecated — remove it from theme/zed/style.ts`).toBe(
        false,
      )
      // The ratchet: a future membership failure must not be "fixed" by
      // registering the deprecated key in either schema file.
      expect(
        key in vendored.definitions.ThemeStyleContent.properties,
        `${key} must not exist in the vendored schema`,
      ).toBe(false)
      expect(
        key in extended.definitions.ThemeStyleContentExtensions.properties,
        `${key} must not be added to schemas/zed-v0.2.0-extended.json`,
      ).toBe(false)
    }
  })
})
