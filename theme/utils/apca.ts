// @ts-expect-error — apca-w3 ships JS only, no .d.ts
import { calcAPCA } from 'apca-w3'

/**
 * APCA contrast checking for the theme's semantic token pairs.
 *
 * APCA (https://apcacontrast.com) is the WCAG 3 successor for perceptual
 * contrast — more accurate than WCAG 2 ratios on dark backgrounds.
 *
 * Lc thresholds (Bronze, see https://github.com/Myndex/SAPC-APCA/wiki):
 *  - Lc 60  body text content (14px+)
 *  - Lc 75  smaller body text (16px/500wt or 18px/400wt)
 *  - Lc 45  headers / large text
 *  - Lc 30  spot-readable non-content (placeholder, disabled, hint)
 *  - Lc 15  non-text (icons, borders)
 */

export type ContrastPair = {
  /** Stable id used in reports + exemption lookups. */
  name: string
  /** Foreground hex (6 or 8 digit). */
  fg: string
  /** Background hex (6 or 8 digit). */
  bg: string
  /** Required minimum |Lc|. */
  minLc: number
}

export type ContrastResult = {
  pair: ContrastPair
  /** Absolute Lc value, rounded to 2 decimals. */
  lc: number
  pass: boolean
  /** Distance below threshold (0 if passing). */
  gap: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function checkPair(p: ContrastPair): ContrastResult {
  const raw = Math.abs(calcAPCA(p.fg, p.bg) as number)
  const lc = round2(raw)
  const pass = lc >= p.minLc
  return { pair: p, lc, pass, gap: pass ? 0 : round2(p.minLc - lc) }
}

export function checkAllPairs(pairs: ContrastPair[]): ContrastResult[] {
  return pairs.map(checkPair)
}

export function formatReport(results: ContrastResult[]): string {
  const lines: string[] = ['APCA contrast report (Bronze thresholds)', '']
  const fail = results.filter((r) => !r.pass)
  const pass = results.filter((r) => r.pass)
  lines.push(`PASS: ${pass.length}/${results.length}`)
  lines.push('')
  for (const r of results) {
    const status = r.pass ? '✓' : '✗'
    const gap = r.gap > 0 ? `  (need +${r.gap})` : ''
    lines.push(
      `  ${status} ${r.pair.name.padEnd(28)} Lc=${String(r.lc).padStart(6)}  min=${r.pair.minLc}${gap}`,
    )
  }
  if (fail.length) {
    lines.push('')
    lines.push(`FAILED: ${fail.length}`)
    for (const r of fail) {
      lines.push(`  ${r.pair.name}: Lc=${r.lc} < ${r.pair.minLc}`)
    }
  }
  return lines.join('\n') + '\n'
}
