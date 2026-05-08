/**
 * Zed `accents[]` array — used for indent rainbow guides and accent
 * highlights in the agent panel. Order matters: nested indents cycle
 * through these.
 *
 * 7 entries by reference-theme convention (One, Catppuccin).
 */
import { PINKS, TEALS, LAVENDERS, CHARTREUSES, BLUES } from '../palette.js'
import { to8 } from './hex.js'

export const zedAccents = [
  to8(PINKS[500]),
  to8(TEALS[200]),
  to8(LAVENDERS[300]),
  to8(CHARTREUSES[200]),
  to8(BLUES[300]),
  to8(PINKS[300]),
  to8(LAVENDERS[500]),
] as const
