/**
 * Editor-neutral font-style flags. Adapters render to their target format:
 *
 * - VSCode wants a space-separated string ('italic bold underline')
 * - Zed wants `font_style: 'italic' | 'normal'` + `font_weight: 100..900`
 *   (no per-token underline equivalent)
 */
export type FontStyle = {
  italic?: boolean
  bold?: boolean
  underline?: boolean
}

/** VSCode TextMate `fontStyle` string ('italic bold underline'). Returns undefined when no flag is set. */
export const renderVSCode = (style?: FontStyle): string | undefined => {
  if (!style) return undefined
  const parts = [
    style.italic && 'italic',
    style.bold && 'bold',
    style.underline && 'underline',
  ].filter(Boolean) as string[]
  return parts.length ? parts.join(' ') : undefined
}

/**
 * Zed `syntax` entry partial: `{ font_style?, font_weight? }`. Underline is dropped
 * (Zed has no per-syntax-token underline; preserve italic + map bold→weight 700).
 */
export const renderZed = (
  style?: FontStyle,
): { font_style?: 'italic' | 'normal'; font_weight?: 700 } => {
  if (!style) return {}
  return {
    ...(style.italic ? { font_style: 'italic' as const } : {}),
    ...(style.bold ? { font_weight: 700 as const } : {}),
  }
}
