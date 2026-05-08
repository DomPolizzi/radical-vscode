/**
 * Zed v0.2.0 schema requires 8-digit hex (#RRGGBBAA) for all colors;
 * 6-digit and 3-digit shorthand fail validation. This helper normalizes
 * any input hex to 8 digits, defaulting alpha to ff (fully opaque).
 */
export function to8(hex: string): string {
  if (!hex.startsWith('#')) {
    throw new Error(`to8: not a hex color: ${hex}`)
  }
  const body = hex.slice(1)
  if (body.length === 8) return `#${body.toLowerCase()}`
  if (body.length === 6) return `#${body.toLowerCase()}ff`
  if (body.length === 3) {
    const expanded = body
      .split('')
      .map((c) => c + c)
      .join('')
    return `#${expanded.toLowerCase()}ff`
  }
  if (body.length === 4) {
    // shorthand with alpha (#RGBA)
    const expanded = body
      .split('')
      .map((c) => c + c)
      .join('')
    return `#${expanded.toLowerCase()}`
  }
  throw new Error(`to8: invalid hex length: ${hex}`)
}
