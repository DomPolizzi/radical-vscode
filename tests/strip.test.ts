import { describe, expect, it } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'

/**
 * Cross-target field stripping. Each adapter must emit ONLY keys that are
 * meaningful to its target editor; leakage between adapters indicates a
 * coupling bug.
 */

const root = process.cwd()

async function loadJson(rel: string): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(path.resolve(root, rel), 'utf8'))
}

describe('VSCode JSON', () => {
  it('does not contain Zed-only top-level keys', async () => {
    const j = await loadJson('dist/RadicalReborn.json')
    expect(j).not.toHaveProperty('appearance')
    expect(j).not.toHaveProperty('style')
    expect(j).not.toHaveProperty('themes')
    expect(j).not.toHaveProperty('players')
    expect(j).not.toHaveProperty('accents')
    expect(j).not.toHaveProperty('syntax')
  })

  it('contains required VSCode keys', async () => {
    const j = await loadJson('dist/RadicalReborn.json')
    expect(j).toHaveProperty('$schema', 'vscode://schemas/color-theme')
    expect(j).toHaveProperty('name', 'Radical Reborn')
    expect(j).toHaveProperty('colorSpaceName')
    expect(j).toHaveProperty('semanticClass')
    expect(j).toHaveProperty('colors')
    expect(j).toHaveProperty('tokenColors')
  })
})

describe('Zed JSON', () => {
  it('does not contain VSCode-only fields', async () => {
    const j = await loadJson('themes/radical-reborn.json')
    expect(j).not.toHaveProperty('colorSpaceName')
    expect(j).not.toHaveProperty('semanticClass')
    expect(j).not.toHaveProperty('tokenColors')
    expect(j).not.toHaveProperty('colors')
  })

  it('contains required Zed family fields', async () => {
    const j = await loadJson('themes/radical-reborn.json')
    expect(j).toHaveProperty('$schema', 'https://zed.dev/schema/themes/v0.2.0.json')
    expect(j).toHaveProperty('name', 'Radical Reborn')
    expect(j).toHaveProperty('author')
    expect(Array.isArray(j.themes)).toBe(true)
    expect((j.themes as unknown[]).length).toBeGreaterThan(0)
  })

  it('first variant has style with required keys', async () => {
    const j = await loadJson('themes/radical-reborn.json')
    const variant = (j.themes as Array<{ name: string; appearance: string; style: Record<string, unknown> }>)[0]
    expect(variant.appearance).toBe('dark')
    expect(variant.style).toHaveProperty('background')
    expect(variant.style).toHaveProperty('editor.background')
    expect(variant.style).toHaveProperty('players')
    expect(variant.style).toHaveProperty('accents')
    expect(variant.style).toHaveProperty('syntax')
  })

  it('players[] has exactly 8 entries', async () => {
    const j = await loadJson('themes/radical-reborn.json')
    const players = (j.themes as Array<{ style: { players: unknown[] } }>)[0].style.players
    expect(players.length).toBe(8)
    for (const p of players) {
      expect(p).toHaveProperty('cursor')
      expect(p).toHaveProperty('background')
      expect(p).toHaveProperty('selection')
    }
  })

  it('all colors are 8-digit hex', async () => {
    const j = await loadJson('themes/radical-reborn.json')
    const variant = (j.themes as Array<{ style: Record<string, unknown> }>)[0]
    const hex8 = /^#[0-9a-fA-F]{8}$/
    for (const [key, value] of Object.entries(variant.style)) {
      if (typeof value === 'string' && value.startsWith('#')) {
        expect(value, `style.${key} should be 8-digit hex`).toMatch(hex8)
      }
    }
  })
})
