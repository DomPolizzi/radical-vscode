/**
 * TextMate scope → canonical Tree-sitter highlight name mapping.
 *
 * The VSCode adapter consumes TM scopes directly via the `token()` helper.
 * The Zed adapter cannot — Zed uses Tree-sitter capture names (a flat list
 * like `comment`, `keyword`, `string`, `function`). This file is the source
 * of truth for converting between the two.
 *
 * Key invariants:
 *  - Every TM scope referenced anywhere under `theme/vscode/` MUST appear
 *    here (either mapped to a canonical key or marked VSCODE_ONLY).
 *  - `VSCODE_ONLY` is a unique Symbol — it cannot accidentally serialize
 *    into a Zed JSON output.
 *  - Compound TM selectors (space-separated like
 *    `meta.link.inline.markdown punctuation.definition.string`) collapse
 *    to their broadest reasonable single Zed key. Lossy mappings are
 *    flagged with `// LOSSY: <what's lost>` comments.
 *
 * Canonical key list comes from Zed v0.2.0 schema + `assets/themes/one/one.json`.
 */

/** Sentinel for TM scopes that have no acceptable Zed equivalent. */
export const VSCODE_ONLY = Symbol.for('radical-reborn.vscode-only')
export type VSCodeOnly = typeof VSCODE_ONLY

/** Canonical Zed Tree-sitter highlight names (v0.2.0 schema). */
export const ZED_SYNTAX_KEYS = [
  'attribute',
  'boolean',
  'comment',
  'comment.doc',
  'constant',
  'constant.builtin',
  'constructor',
  'embedded',
  'emphasis',
  'emphasis.strong',
  'enum',
  'function',
  'hint',
  'keyword',
  'label',
  'link_text',
  'link_uri',
  'namespace',
  'number',
  'operator',
  'predictive',
  'preproc',
  'primary',
  'property',
  'punctuation',
  'punctuation.bracket',
  'punctuation.delimiter',
  'punctuation.list_marker',
  'punctuation.markup',
  'punctuation.special',
  'selector',
  'selector.pseudo',
  'string',
  'string.escape',
  'string.regex',
  'string.special',
  'string.special.symbol',
  'tag',
  'tag.doctype',
  'text.literal',
  'title',
  'type',
  'type.builtin',
  'variable',
  'variable.parameter',
  'variable.special',
  'variant',
  'diff.plus',
  'diff.minus',
] as const

export type ZedSyntaxKey = (typeof ZED_SYNTAX_KEYS)[number]

/**
 * Mapping table. Every TM scope referenced in this repo's language and
 * tokens files appears here. Keep in sync with theme/vscode/tokens.ts and
 * theme/vscode/languages/*.ts; tests/scope-coverage will assert this.
 */
export const TM_TO_CANONICAL: Record<string, ZedSyntaxKey | VSCodeOnly> = {
  // --- Generic / fallback (theme/vscode/tokens.ts)
  comment: 'comment',
  constant: 'constant',
  entity: 'type',
  invalid: VSCODE_ONLY, // Zed has no permanent "invalid" scope; uses `hint` for diagnostics
  keyword: 'keyword',
  markup: 'punctuation.markup',
  storage: 'keyword',
  string: 'string',
  support: 'type',
  variable: 'variable',
  'variable.parameter': 'variable.parameter', // italic preserved by syntax adapter
  'variable.language': 'variable.special', // this/self/super → Zed variable.special
  'support.type': 'type',
  'keyword.control.as': 'keyword', // ultraviolet emphasis is VSCode-only; Zed renders plain keyword (underline dropped, see utils/font-style.ts)
  'keyword.operator.type.asserts': 'operator', // VSCode-only bold; Zed renders plain operator
  'keyword.operator.expression.is': 'operator',
  'entity.name.type': 'type', // italic preserved

  // --- Comment (theme/vscode/languages/comment.ts)
  'comment.block.documentation': 'comment.doc',
  'string.quoted.docstring': 'comment.doc', // Python docstring TM variant
  'comment.block.documentation storage': 'comment.doc', // LOSSY: storage context lost
  'comment.block.documentation entity': 'comment.doc', // LOSSY: entity context lost
  'variable.other.jsdoc': 'variable',

  // --- Go (theme/vscode/languages/go.ts)
  'source.go': VSCODE_ONLY, // language-root scope, not a highlight
  'support.function': 'function',
  'keyword.control': 'keyword',
  'keyword.import': 'keyword',
  'constant.language.go': 'constant.builtin',

  // --- HTML (theme/vscode/languages/html.ts)
  'punctuation.separator.key-value.html': 'punctuation.delimiter',
  'meta.tag.structure.any.html': 'tag', // LOSSY: structural distinction lost
  'meta.tag.inline.any.html': 'tag', // LOSSY: inline distinction lost

  // --- JavaScript/TypeScript (theme/vscode/languages/javascript.ts)
  'constant.language.boolean': 'boolean',
  'constant.language.null': 'constant.builtin',
  'entity.name.function': 'function',
  'keyword.control.flow': 'keyword',
  'keyword.control.export': 'keyword',
  'keyword.control.import': 'keyword',
  'keyword.control.from': 'keyword',
  'keyword.operator': 'operator',
  'storage.type.function': 'keyword',
  'storage.type.function.arrow': 'operator',
  'string.template': 'string',

  // --- JSON (theme/vscode/languages/json.ts)
  'support.type.property-name.json': 'property',
  'source.json string': 'string', // LOSSY: source.json context lost (Zed knows it's JSON via grammar)
  'source.json punctuation.separator': 'punctuation.delimiter', // LOSSY
  'source.json punctuation.definition.dictionary': 'punctuation.bracket', // LOSSY
  'source.json punctuation.definition.array': 'punctuation.bracket', // LOSSY

  // --- Markdown (theme/vscode/languages/markdown.ts)
  'meta.paragraph.markdown': 'text.literal',
  'comment.block.html': 'comment',
  'entity.name.section.markdown': 'title', // bold preserved
  'punctuation.definition.heading.markdown': 'punctuation.markup', // bold preserved
  'markup.inline.raw.string.markdown': 'string.special',
  'punctuation.definition.raw.markdown': 'punctuation.markup',
  'markup.fenced_code.block.markdown': VSCODE_ONLY, // Zed has no unified fenced-block scope
  'meta.separator.markdown': 'punctuation.special',
  'meta.link.inline.markdown': 'link_uri',
  'markup.underline.link': 'link_uri', // italic preserved
  'meta.link.inline.markdown punctuation.definition.string': 'punctuation.special', // LOSSY: link context lost
  'constant.other.reference.link': 'link_text',
  'meta.link.reference.def markup.underline.link': 'link_uri', // LOSSY: definition context lost
  'meta.link.reference.def punctuation.definition.constant': 'punctuation.special', // LOSSY
  'punctuation.definition.list.begin': 'punctuation.list_marker',
  'markup.bold.markdown': 'emphasis.strong',
  'markup.italic.markdown': 'emphasis',
  'markup.italic.markdown punctuation.definition': 'punctuation.special', // LOSSY: italic-context lost

  // --- React/JSX (theme/vscode/languages/react.ts)
  'support.class.component': 'type', // PascalCase JSX components — Zed Tree-sitter via node type
  'entity.name.tag': 'tag',
  'entity.other.attribute-name': 'attribute',
  'punctuation.definition.tag': 'punctuation.bracket',

  // --- YAML (theme/vscode/languages/yaml.ts)
  'entity.name.tag.yaml': 'property',
  'source.yaml string': 'string', // LOSSY: source.yaml context lost
  'source.yaml punctuation.separator': 'punctuation.delimiter', // LOSSY
  'source.yaml punctuation.definition.sequence': 'punctuation.bracket', // LOSSY
}

/** Resolve a TM scope to its Zed key, or undefined if VSCODE_ONLY / unmapped. */
export function toZedKey(scope: string): ZedSyntaxKey | undefined {
  const v = TM_TO_CANONICAL[scope]
  if (v === undefined || v === VSCODE_ONLY) return undefined
  return v
}

/** True if scope is intentionally not mapped to Zed (vs. unmapped which would be a bug). */
export function isVSCodeOnly(scope: string): boolean {
  return TM_TO_CANONICAL[scope] === VSCODE_ONLY
}
