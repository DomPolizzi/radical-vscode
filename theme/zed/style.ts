/**
 * Zed v0.2.0 `style` map — maps `semantic.ts` to Zed style keys.
 *
 * Style key reference: https://zed.dev/schema/themes/v0.2.0.json
 * Live example: https://github.com/zed-industries/zed/blob/main/assets/themes/one/one.json
 *
 * All values are 8-digit hex (#RRGGBBAA) per the schema.
 */
import semantic from '../semantic.js'
import { PINKS, BLUES, LAVENDERS, TEALS, CHARTREUSES, GRAYS } from '../palette.js'
import { alpha } from '../utils/alpha.js'
import { to8 } from './hex.js'

// Backgrounds widened with alpha for overlays + transient highlights
const DROP_TARGET = alpha(semantic.accent, 0.6)
const ACTIVE_LINE_BG = alpha(LAVENDERS[400], 0.08)
const READ_HIGHLIGHT = alpha(BLUES[200], 0.18)
const WRITE_HIGHLIGHT = alpha(PINKS[400], 0.22)

// Scrollbar + minimap thumbs share one lavender source (matching the active-line
// family, see assets/TODO) so the two chromes can't drift apart. Mirrored by
// SCROLLBAR_LAVENDER in theme/vscode/workbench.ts.
const SCROLLBAR_THUMB = alpha(LAVENDERS[400], 0.2)
const SCROLLBAR_THUMB_HOVER = alpha(LAVENDERS[400], 0.35)
const SCROLLBAR_THUMB_ACTIVE = alpha(LAVENDERS[400], 0.45)

export const zedStyle = {
  // --- Surfaces / borders
  background: to8(semantic.bgPrimary),
  'surface.background': to8(semantic.bgElevated),
  'elevated_surface.background': to8(semantic.bgElevated),
  border: to8('#1A1B46'),
  'border.variant': to8('#242560'),
  'border.focused': to8(semantic.accent),
  'border.selected': to8(semantic.accent),
  'border.transparent': '#00000000',
  'border.disabled': to8('#415e6c'),
  'drop_target.background': to8(DROP_TARGET),

  // --- Element states (sidebar items, command palette rows, etc.)
  'element.background': '#00000000',
  'element.hover': alpha(semantic.accent, 0.05),
  'element.active': alpha(semantic.accent, 0.12),
  'element.selected': alpha(semantic.accent, 0.18),
  'element.disabled': '#00000000',
  'ghost_element.background': '#00000000',
  'ghost_element.hover': alpha(semantic.accent, 0.05),
  'ghost_element.active': alpha(semantic.accent, 0.1),
  'ghost_element.selected': alpha(semantic.accent, 0.15),
  'ghost_element.disabled': '#00000000',

  // --- Text/icons
  text: to8(semantic.fgPrimary),
  'text.muted': to8(semantic.fgMuted),
  'text.placeholder': to8(semantic.fgPlaceholder),
  'text.disabled': to8('#415e6c'),
  'text.accent': to8(semantic.accent),
  icon: to8(semantic.fgMuted),
  'icon.muted': to8(GRAYS[300]),
  'icon.disabled': to8('#415e6c'),
  'icon.placeholder': to8(semantic.fgPlaceholder),
  'icon.accent': to8(semantic.accent),
  'link_text.hover': to8(TEALS[200]),

  // --- Editor
  'editor.foreground': to8(semantic.fgPrimary),
  'editor.background': to8(semantic.bgPrimary),
  'editor.gutter.background': to8(semantic.bgPrimary),
  'editor.subheader.background': to8(semantic.currentScopeBackground),
  'editor.active_line.background': ACTIVE_LINE_BG,
  'editor.highlighted_line.background': alpha(semantic.accent, 0.1),
  'editor.line_number': to8('#415e6c'),
  'editor.active_line_number': to8(semantic.accent),
  'editor.hover_line_number': to8(semantic.fgMuted),
  'editor.invisible': to8('#262b4b'),
  'editor.indent_guide': to8('#1c1a30'),
  'editor.indent_guide_active': to8('#242560'),
  'editor.wrap_guide': to8('#1c1a30'),
  'editor.active_wrap_guide': to8('#242560'),
  'editor.document_highlight.read_background': READ_HIGHLIGHT,
  'editor.document_highlight.write_background': WRITE_HIGHLIGHT,
  'editor.document_highlight.bracket_background': alpha(LAVENDERS[300], 0.3),

  // --- Tabs / chrome
  'tab_bar.background': to8(semantic.bgUltra),
  'tab.active_background': to8(semantic.bgPrimary),
  'tab.inactive_background': to8(semantic.bgUltra),
  'title_bar.background': to8(semantic.bgUltra),
  'title_bar.inactive_background': to8(semantic.bgUltra),
  'toolbar.background': to8(semantic.bgPrimary),
  'status_bar.background': to8(semantic.bgUltra),

  // --- Panels (terminal, problems, etc.)
  'panel.background': to8(semantic.bgPrimary),
  'panel.focused_border': to8(semantic.accent),
  'panel.indent_guide': to8('#1c1a30'),
  'panel.indent_guide_active': to8('#242560'),
  'panel.indent_guide_hover': to8('#242560'),

  // --- Search
  'search.match_background': alpha(PINKS[500], 0.35),
  'search.active_match_background': to8(PINKS[500]),

  // --- Scrollbar
  'scrollbar.thumb.background': SCROLLBAR_THUMB,
  'scrollbar.thumb.hover_background': SCROLLBAR_THUMB_HOVER,
  // Post-v0.2.0 engine key (see schemas/zed-v0.2.0-extended.json)
  'scrollbar.thumb.active_background': SCROLLBAR_THUMB_ACTIVE,
  'scrollbar.thumb.border': '#00000000',
  'scrollbar.track.background': to8(semantic.bgPrimary),
  'scrollbar.track.border': '#00000000',

  // --- Minimap thumb (post-v0.2.0 engine keys; mirrors the scrollbar consts)
  'minimap.thumb.background': SCROLLBAR_THUMB,
  'minimap.thumb.hover_background': SCROLLBAR_THUMB_HOVER,
  'minimap.thumb.active_background': SCROLLBAR_THUMB_ACTIVE,
  'minimap.thumb.border': '#00000000',

  // --- Terminal (full ANSI: 8 base + bright + dim)
  'terminal.background': to8(semantic.bgPrimary),
  'terminal.foreground': to8(semantic.fgPrimary),
  'terminal.bright_foreground': to8(BLUES[100]),
  'terminal.dim_foreground': to8(GRAYS[400]),
  'terminal.ansi.background': to8(semantic.bgPrimary),
  'terminal.ansi.black': to8(semantic.bgUltra),
  'terminal.ansi.bright_black': to8('#415e6c'),
  'terminal.ansi.dim_black': to8(semantic.bgUltra),
  'terminal.ansi.red': to8(semantic.accent),
  'terminal.ansi.bright_red': to8(PINKS[600]),
  'terminal.ansi.dim_red': to8(PINKS[200]),
  'terminal.ansi.green': to8(semantic['vcs.added']),
  'terminal.ansi.bright_green': to8(CHARTREUSES[200]),
  'terminal.ansi.dim_green': to8(CHARTREUSES[300]),
  'terminal.ansi.yellow': to8(semantic.warning),
  'terminal.ansi.bright_yellow': to8(CHARTREUSES[100]),
  'terminal.ansi.dim_yellow': to8('#c8ff00'),
  'terminal.ansi.blue': to8(BLUES[300]),
  'terminal.ansi.bright_blue': to8(BLUES[100]),
  'terminal.ansi.dim_blue': to8(BLUES[200]),
  'terminal.ansi.magenta': to8(LAVENDERS[300]),
  'terminal.ansi.bright_magenta': to8(LAVENDERS[500]),
  'terminal.ansi.dim_magenta': to8(LAVENDERS[200]),
  'terminal.ansi.cyan': to8(TEALS[200]),
  'terminal.ansi.bright_cyan': to8(TEALS[100]),
  'terminal.ansi.dim_cyan': to8(TEALS[300]),
  'terminal.ansi.white': to8(GRAYS[100]),
  'terminal.ansi.bright_white': to8(BLUES[100]),
  'terminal.ansi.dim_white': to8(GRAYS[300]),

  // --- Status / diagnostics
  'error.background': alpha(semantic.error, 0.15),
  'error.border': to8(semantic.error),
  warning: to8(semantic.warning),
  'warning.background': alpha(semantic.warning, 0.15),
  'warning.border': to8(semantic.warning),
  success: to8(semantic['vcs.added']),
  'success.background': alpha(semantic['vcs.added'], 0.15),
  'success.border': to8(semantic['vcs.added']),
  info: to8(semantic.info),
  'info.background': alpha(semantic.info, 0.15),
  'info.border': to8(semantic.info),
  hint: to8(semantic.parameterAnnotation),
  'hint.background': alpha(semantic.parameterAnnotation, 0.15),
  'hint.border': to8(semantic.parameterAnnotation),
  conflict: to8('#ff428a'),
  'conflict.background': alpha('#ff428a', 0.15),
  'conflict.border': to8('#ff428a'),
  predictive: to8(semantic.aiCompletionPreview),
  'predictive.background': '#00000000',
  'predictive.border': '#00000000',
  unreachable: alpha(semantic.fgMuted, 0.4),
  'unreachable.background': '#00000000',
  'unreachable.border': '#00000000',

  // Plain `error` foreground (sibling of error.background/border)
  error: to8(semantic.error),

  // --- File status (project panel + tab dot indicators)
  created: to8(semantic['vcs.added']),
  'created.background': '#00000000',
  'created.border': to8(semantic['vcs.added']),
  modified: to8(semantic['vcs.modified']),
  'modified.background': '#00000000',
  'modified.border': to8(semantic['vcs.modified']),
  deleted: to8(semantic['vcs.deleted']),
  'deleted.background': '#00000000',
  'deleted.border': to8(semantic['vcs.deleted']),
  renamed: to8(semantic.warning),
  'renamed.background': '#00000000',
  'renamed.border': to8(semantic.warning),
  ignored: to8('#415e6c'),
  'ignored.background': '#00000000',
  'ignored.border': to8('#415e6c'),
  hidden: to8('#5a6470'),
  'hidden.background': '#00000000',
  'hidden.border': to8('#5a6470'),

  // --- Version control (diff gutter + inline)
  'version_control.added': to8(semantic['vcs.added']),
  'version_control.modified': to8(semantic['vcs.modified']),
  'version_control.deleted': to8(semantic['vcs.deleted']),
  'version_control.word_added': alpha(semantic['vcs.added'], 0.3),
  'version_control.word_deleted': alpha(semantic['vcs.deleted'], 0.3),
  'version_control.conflict_marker.ours': alpha(semantic['vcs.added'], 0.2),
  'version_control.conflict_marker.theirs': alpha(BLUES[300], 0.2),
} as const
