/**
 * APCA contrast check entry point.
 *
 * Reads SEMANTIC_PAIRS, applies APCA_EXEMPTIONS, writes
 * `dist/apca-report.txt`, and exits non-zero on any non-exempt failure.
 *
 * Run via: `npm run check:contrast`
 *
 * Phase 4's `build-all.ts` orchestrator will call this alongside the
 * VSCode and Zed adapter builds.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { checkAllPairs, formatReport } from './utils/apca.js'
import { SEMANTIC_PAIRS } from './utils/apca-pairs.js'
import { APCA_EXEMPTIONS, isExempt } from './utils/apca-exemptions.js'

const results = checkAllPairs(SEMANTIC_PAIRS)

const nonExemptFailures = results.filter((r) => !r.pass && !isExempt(r.pair.name))
const exemptFailures = results.filter((r) => !r.pass && isExempt(r.pair.name))

const report = [
  formatReport(results),
  '',
  `Exempted slots (${APCA_EXEMPTIONS.size}):`,
  ...Array.from(APCA_EXEMPTIONS.values()).map((e) => `  - ${e.name}: ${e.reason}`),
  '',
  exemptFailures.length
    ? `Exempt failures (acknowledged): ${exemptFailures.map((r) => r.pair.name).join(', ')}`
    : 'No exempt failures.',
  '',
  nonExemptFailures.length
    ? `BLOCKING failures (${nonExemptFailures.length}): ${nonExemptFailures.map((r) => r.pair.name).join(', ')}`
    : 'No blocking failures.',
  '',
].join('\n')

await fs.mkdir(path.resolve(process.cwd(), 'dist'), { recursive: true })
await fs.writeFile(path.resolve(process.cwd(), 'dist/apca-report.txt'), report)

process.stdout.write(report)

if (nonExemptFailures.length > 0) {
  process.stderr.write(
    `\n${nonExemptFailures.length} non-exempt APCA failure(s). Either tweak the colors or add an exemption with justification in theme/utils/apca-exemptions.ts.\n`,
  )
  process.exit(1)
}
