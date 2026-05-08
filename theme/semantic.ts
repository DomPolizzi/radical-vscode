import { GRAYS, CHARTREUSES, PINKS, TEALS } from './palette.js'

const semantic = {
  comment: GRAYS[500],
  constant: CHARTREUSES[100],
  entity: '#a6e2e0',
  keyword: '#d5358f',
  markup: GRAYS[150], // ⓘ matches editor foreground color
  storage: PINKS[300],
  string: TEALS[100],
  support: '#7cb3b6',
  variable: GRAYS[100],
  // --- Status syntax tokens
  invalid: '#ff427b',
}

export default semantic
