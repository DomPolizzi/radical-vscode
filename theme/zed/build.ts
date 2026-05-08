/**
 * Zed adapter build: assembles theme JSON for the Zed v0.2.0 schema.
 *
 * Output: `themes/radical-reborn.json` (committed to repo root so the
 * extension submodule path matches what registry CI expects).
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { zedStyle } from './style.js'
import { zedSyntax } from './syntax.js'
import { zedPlayers } from './players.js'
import { zedAccents } from './accents.js'

const theme = {
  $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
  name: 'Radical Reborn',
  author: 'Aqua (fork) — original Radical by Dan Hedgecock',
  themes: [
    {
      name: 'Radical Reborn',
      appearance: 'dark',
      style: {
        ...zedStyle,
        players: zedPlayers,
        accents: zedAccents,
        syntax: zedSyntax,
      },
    },
  ],
} as const

const out = path.resolve(process.cwd(), 'themes/radical-reborn.json')
await fs.mkdir(path.dirname(out), { recursive: true })
await fs.writeFile(out, JSON.stringify(theme, null, 2))
console.log(`Zed build finished → ${out}`)
