import semantic from '../semantic.js'
import type { ContrastPair } from './apca.js'

/**
 * APCA contrast pairs to validate at build time.
 *
 * Each entry says: this foreground from `semantic` is rendered against
 * this background, and must clear `minLc` (or be on the exemption list).
 *
 * Backgrounds: bgPrimary is the editor canvas; bgElevated covers panels
 * and overlays; bgUltra covers the activity bar and title bar — text
 * rendered on those surfaces should be checked separately when relevant.
 */
export const SEMANTIC_PAIRS: ContrastPair[] = [
  // --- Syntax tokens against the editor canvas (bgPrimary)
  { name: 'comment', fg: semantic.comment, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'constant', fg: semantic.constant, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'entity', fg: semantic.entity, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'keyword', fg: semantic.keyword, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'markup', fg: semantic.markup, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'storage', fg: semantic.storage, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'string', fg: semantic.string, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'support', fg: semantic.support, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'variable', fg: semantic.variable, bg: semantic.bgPrimary, minLc: 60 },

  // --- Foreground hierarchy
  { name: 'fgPrimary', fg: semantic.fgPrimary, bg: semantic.bgPrimary, minLc: 75 },
  { name: 'fgMuted', fg: semantic.fgMuted, bg: semantic.bgPrimary, minLc: 60 },

  // --- AI / annotation surfaces (lower thresholds — intentionally subtle)
  { name: 'aiCompletionPreview', fg: semantic.aiCompletionPreview, bg: semantic.bgPrimary, minLc: 30 },
  { name: 'parameterAnnotation', fg: semantic.parameterAnnotation, bg: semantic.bgPrimary, minLc: 30 },

  // --- Diagnostics
  { name: 'error', fg: semantic.error, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'warning', fg: semantic.warning, bg: semantic.bgPrimary, minLc: 60 },
  { name: 'info', fg: semantic.info, bg: semantic.bgPrimary, minLc: 60 },

  // --- Version control gutter / file status
  { name: 'vcs.added', fg: semantic['vcs.added'], bg: semantic.bgPrimary, minLc: 45 },
  { name: 'vcs.modified', fg: semantic['vcs.modified'], bg: semantic.bgPrimary, minLc: 45 },
  { name: 'vcs.deleted', fg: semantic['vcs.deleted'], bg: semantic.bgPrimary, minLc: 45 },

  // --- Placeholder
  { name: 'fgPlaceholder', fg: semantic.fgPlaceholder, bg: semantic.bgPrimary, minLc: 30 },
]
