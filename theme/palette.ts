/**
 * Tier 1 — Primitive palette. Named hue groups; no semantics.
 *
 * Every export is `as const satisfies Record<number, '#${string}'>` so that
 * consumers narrow on stop keys and downstream `chroma()` failures become
 * impossible at compile time.
 */

type HexStops = Record<number, `#${string}`>

export const GRAYS = {
  100: '#B4DAE9',
  150: '#94b4c4',
  200: '#75B7BB',
  300: '#7c9c9e',
  400: '#639196',
  500: '#45898C',
} as const satisfies HexStops

export const BLUES = {
  100: '#BAF7FC',
  150: '#8ce1e7',
  200: '#79D5DB',
  300: '#6ACBD8',
} as const satisfies HexStops

export const CHARTREUSES = {
  100: '#E5FCA6',
  150: '#DFFD8E',
  200: '#DCFF7A',
  300: '#B3E27C',
} as const satisfies HexStops

export const PINKS = {
  100: '#fda8bc',
  200: '#FE8DA5',
  300: '#F37AB0',
  400: '#F272AA',
  500: '#FB4293',
  600: '#FF1998',
} as const satisfies HexStops

export const LAVENDERS = {
  100: '#cbbce7',
  200: '#d9a3e0',
  300: '#be8ce7',
  400: '#cd8ce7',
  500: '#ec99f7',
} as const satisfies HexStops

/**
 * Saturated ~260° blue-violets — selection chrome and assertion emphasis.
 * Distinct from LAVENDERS (pale orchids, used for types): these read as vivid
 * violet, not pastel. Stops are lightest-first; every stop has a real consumer
 * (100: text-grade, chosen to clear APCA Lc 45 on bgPrimary; 200: chrome /
 * selection grade — do not use 200 for text, it measures ~Lc 29).
 */
export const ULTRAVIOLETS = {
  100: '#aa86fd',
  200: '#864df8',
} as const satisfies HexStops

export const TEALS = {
  100: '#A9FEF7',
  200: '#A4FFE4',
  300: '#7AFFE2',
} as const satisfies HexStops

export const GREENS = {
  100: '#B3E4C2',
} as const satisfies HexStops

/** Any hex literal in the palette. */
export type Hex = `#${string}`
