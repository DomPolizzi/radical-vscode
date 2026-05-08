import { describe, expect, it } from 'vitest'
import { checkAllPairs } from '../theme/utils/apca.js'
import { SEMANTIC_PAIRS } from '../theme/utils/apca-pairs.js'
import { isExempt } from '../theme/utils/apca-exemptions.js'

/**
 * Programmatic counterpart to `npm run check:contrast`. Catches the case
 * where someone tweaks a semantic value and silently drops a previously-
 * passing pair below threshold.
 */
describe('APCA contrast', () => {
  const results = checkAllPairs(SEMANTIC_PAIRS)

  it('every pair has a result', () => {
    expect(results.length).toBe(SEMANTIC_PAIRS.length)
  })

  it('no non-exempt failures', () => {
    const blocking = results.filter((r) => !r.pass && !isExempt(r.pair.name))
    expect(
      blocking.map((r) => `${r.pair.name}: Lc=${r.lc} < ${r.pair.minLc}`),
      'New non-exempt APCA failures — fix the colors or add an exemption with justification',
    ).toEqual([])
  })

  it('passing pairs really do clear their thresholds', () => {
    const passing = results.filter((r) => r.pass)
    for (const r of passing) {
      expect(r.lc).toBeGreaterThanOrEqual(r.pair.minLc)
    }
  })
})
