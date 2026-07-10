/**
 * Zed v0.2.0 `syntax` map.
 *
 * Keys are canonical Tree-sitter highlight names (see ZED_SYNTAX_KEYS in
 * theme/mappings/tm-to-canonical.ts). Each entry: { color, font_style?,
 * font_weight? }.
 *
 * Schema constraints (verified against zed-industries/zed):
 *  - font_style is **lowercase**: "italic" | "normal" | "oblique".
 *  - font_weight is integer 100..900; we use 700 for bold.
 *  - Colors are 8-digit hex (#RRGGBBAA).
 *  - Underline has no per-syntax-token equivalent — the FontStyle
 *    underline flag is dropped here (preserved only in the VSCode
 *    output where TextMate's `fontStyle` accepts it).
 */
import semantic from '../semantic.js'
import { LAVENDERS, PINKS, BLUES, GRAYS, GREENS, CHARTREUSES, TEALS } from '../palette.js'
import { renderZed, type FontStyle } from '../utils/font-style.js'
import { to8 } from './hex.js'
import type { ZedSyntaxKey } from '../mappings/tm-to-canonical.js'

type SyntaxEntry = {
  color: string
  font_style?: 'italic' | 'normal' | 'oblique'
  font_weight?: 700
}

const entry = (color: string, style?: FontStyle): SyntaxEntry => ({
  color: to8(color),
  ...renderZed(style),
})

export const zedSyntax: Partial<Record<ZedSyntaxKey, SyntaxEntry>> = {
  // --- Comments
  comment: entry(semantic.comment, { italic: true }),
  'comment.doc': entry(semantic.comment, { italic: true }),

  // --- Constants / literals
  constant: entry(semantic.constant),
  'constant.builtin': entry(CHARTREUSES[200]),
  boolean: entry(CHARTREUSES[300]),
  number: entry(semantic.constant),

  // --- Strings
  string: entry(semantic.string),
  'string.escape': entry(TEALS[300]),
  'string.regex': entry(TEALS[200]),
  'string.special': entry(PINKS[200]),
  'string.special.symbol': entry(PINKS[200]),

  // --- Functions / types / classes
  function: entry(BLUES[150]),
  type: entry(LAVENDERS[500], { italic: true }),
  'type.builtin': entry(LAVENDERS[400], { italic: true }),
  enum: entry(LAVENDERS[400]),
  variant: entry(LAVENDERS[400]),
  constructor: entry(LAVENDERS[500]),

  // --- Keywords / operators
  keyword: entry(semantic.keyword),
  operator: entry(PINKS[200]),
  label: entry(PINKS[400]),

  // --- Variables / parameters / properties
  variable: entry(semantic.variable),
  'variable.parameter': entry(GRAYS[100], { italic: true }),
  'variable.special': entry(PINKS[300], { italic: true }),
  property: entry(GREENS[100]),
  attribute: entry(GREENS[100]),

  // --- Tags / namespaces
  tag: entry(BLUES[300]),
  'tag.doctype': entry(GRAYS[300], { italic: true }),
  namespace: entry(LAVENDERS[300]),

  // --- Punctuation (lifted to editor-foreground brightness — VSCode parity, less "matte")
  punctuation: entry(GRAYS[100]),
  'punctuation.bracket': entry(GRAYS[100]),
  'punctuation.delimiter': entry(GRAYS[200]),
  'punctuation.list_marker': entry(TEALS[200]),
  'punctuation.markup': entry(GRAYS[100]),
  'punctuation.special': entry(PINKS[300]),

  // --- Markup (Markdown)
  emphasis: entry('#abdada', { italic: true }),
  'emphasis.strong': entry('#74A39D', { bold: true }),
  title: entry('#ffdfee', { bold: true }),
  link_text: entry('#9ceeeb'),
  link_uri: entry('#a8ffefad', { italic: true }),
  'text.literal': entry('#bccfcf'),

  // --- Diagnostics / inline editor metadata
  hint: entry(semantic.parameterAnnotation, { italic: true }),
  predictive: entry(semantic.aiCompletionPreview, { italic: true }),

  // --- Diff (markup-driven)
  'diff.plus': entry(semantic['diff.added']),
  'diff.minus': entry(semantic['diff.removed']),

  // --- Misc Zed-specific
  embedded: entry(semantic.fgPrimary),
  preproc: entry(LAVENDERS[300]),
  primary: entry(semantic.fgPrimary),
  selector: entry(BLUES[300]),
  'selector.pseudo': entry(LAVENDERS[200], { italic: true }),
}
