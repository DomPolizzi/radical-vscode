import { GRAYS, CHARTREUSES, PINKS, TEALS, ULTRAVIOLETS } from './palette.js'

/**
 * Tier 2 — Semantic, role-based, editor-neutral token slots.
 *
 * Existing TextMate syntax slots are preserved unchanged so the VSCode
 * adapter's output remains byte-identical to v0.1.0. New role-based slots
 * (background/foreground groups, AI surfaces, diagnostics, VCS) are
 * additive — they're consumed by the Zed adapter (Phase 4) and any future
 * editor adapter; the VSCode adapter ignores them until wired in.
 */
const semantic = {
  // --- Existing TextMate syntax slots (do not rename — VSCode adapter consumes by these names)
  comment: GRAYS[500],
  constant: CHARTREUSES[100],
  entity: '#a6e2e0',
  keyword: '#d5358f',
  markup: GRAYS[150], // ⓘ matches editor foreground color
  storage: PINKS[300],
  string: TEALS[100],
  support: '#7cb3b6',
  variable: GRAYS[100],
  invalid: '#ff427b',

  // --- Syntax emphasis (additive slots; adapters opt in)
  /**
   * TS type assertions (`as`, `asserts`, `is`) — bold-emphasized text, so the
   * APCA gate holds it to the Lc 45 emphasized-text tier. Opaque hex only:
   * `calcAPCA` ignores alpha, so an alpha'd value would measure un-composited.
   * VSCode-only today — Zed's syntax model has no assertion-specific key.
   */
  typeAssertion: ULTRAVIOLETS[100],

  // --- Backgrounds (Zed: editor.background, surface.background, etc.)
  bgPrimary: '#141322',
  bgElevated: '#1c1a30',
  bgUltra: '#100f1a',
  /** Sticky scroll subheader / current-scope indicator (Zed `editor.subheader.background`). */
  currentScopeBackground: '#181626',

  // --- Foregrounds
  fgPrimary: GRAYS[100],
  fgMuted: GRAYS[150],
  fgPlaceholder: '#5a6470',

  // --- Brand
  accent: '#ff428e',
  accentHover: '#ff6ba6',

  // --- AI / annotations (modern editor surfaces)
  /** Ghost-text style for AI completion previews. Intentionally low contrast (APCA-exempt). */
  aiCompletionPreview: '#B4DAE96B',
  /** Inlay hints / parameter annotations. Italic-friendly, low-mid contrast. */
  parameterAnnotation: '#ff42b788',

  // --- Diagnostics
  error: '#ff1767',
  warning: '#ffd000',
  info: '#93e0e3',

  // --- Version control (Zed: version_control.added/modified/deleted)
  'vcs.added': '#a3ff57',
  'vcs.modified': '#ffb000',
  'vcs.deleted': '#ff427b',

  // --- Diff
  'diff.added': '#43fdd5',
  'diff.removed': '#fe6082',
} as const

export type SemanticKey = keyof typeof semantic
export default semantic
