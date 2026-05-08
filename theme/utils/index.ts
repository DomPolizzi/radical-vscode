export { alpha } from './alpha.js'
export { renderVSCode, renderZed, type FontStyle } from './font-style.js'

import { renderVSCode } from './font-style.js'
import type { FontStyle } from './font-style.js'

/** Generate a VSCode TextMate token color rule. */
export const token = (name: string, color: string, fontStyle?: FontStyle) => ({
  scope: name,
  settings: {
    foreground: color,
    fontStyle: renderVSCode(fontStyle),
  },
})
