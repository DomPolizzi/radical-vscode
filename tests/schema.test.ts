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
