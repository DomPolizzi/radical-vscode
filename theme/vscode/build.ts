import { promises as fs } from 'fs'
import path from 'path'

import { tokenColors } from './tokens'
import { workbenchColors } from './workbench'
import { comment } from './languages/comment'
import { go } from './languages/go'
import { html } from './languages/html'
import { javascript } from './languages/javascript'
import { json } from './languages/json'
import { markdown } from './languages/markdown'
import { react } from './languages/react'
import { yaml } from './languages/yaml'

/**
 * Radical Reborn theme definition (VSCode target)
 *
 * A maintained fork of Dan Hedgecock's Radical theme.
 */
const theme = {
  $schema: 'vscode://schemas/color-theme',
  author: 'Aqua (fork) — original by Dan Hedgecock',
  name: 'Radical Reborn',
  colorSpaceName: 'sRGB',
  semanticClass: 'theme.dark.radical-reborn',
  colors: workbenchColors,
  tokenColors: [
    ...tokenColors,
    ...comment,
    ...go,
    ...html,
    ...markdown,
    ...javascript,
    ...json,
    ...react,
    ...yaml,
  ],
} as const

// Delete any editor color definition whose value is null - as a convention this
// lets us track that all theme variables are being set by assigning values to
// all of them
Object.entries(theme.colors).forEach(([key, value]) => {
  // @ts-expect-error -- Haven't gone to the trouble of typing the string index access yet
  if (value === null) delete theme.colors[key]
})

// 🚀 Write to dist
fs.writeFile(
  path.resolve(process.cwd(), 'dist/RadicalReborn.json'),
  JSON.stringify(theme, null, 2),
)
  .then(() => console.log('Build finished'))
  .catch((err) => console.warn(err))
