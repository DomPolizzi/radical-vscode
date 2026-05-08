/**
 * Zed `players[]` array — 8 collaborator-cursor color slots.
 *
 * Schema (v0.2.0):
 *   players: [{ cursor: hex8, background: hex8, selection: hex8 }, ...]
 *
 * Selection alpha convention from zed-industries reference themes is
 * `3d` (~24%): saturated enough to see, transparent enough not to wash
 * out underlying syntax. The first entry is "you".
 */
import { PINKS, TEALS, LAVENDERS, CHARTREUSES, BLUES, GRAYS } from '../palette.js'
import { to8 } from './hex.js'

const player = (color: string) => ({
  cursor: to8(color),
  background: to8(color),
  selection: `${color.toLowerCase().replace('#', '#').slice(0, 7)}3d`,
})

export const zedPlayers = [
  player(PINKS[500]), // 0 — you (brand pink)
  player(TEALS[200]),
  player(LAVENDERS[300]),
  player(CHARTREUSES[200]),
  player(BLUES[200]),
  player(PINKS[300]),
  player(LAVENDERS[500]),
  player(GRAYS[150]),
] as const
