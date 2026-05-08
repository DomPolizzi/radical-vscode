/**
 * APCA contrast exemptions.
 *
 * Slots listed here are excused from their declared `minLc`. Each entry must
 * include a one-line `reason` for PR-review traceability.
 *
 * Two categories:
 *
 *  1. **Design exemptions** — non-content surfaces (placeholder, ghost text,
 *     disabled state) where high contrast would harm rather than help
 *     readability. These are permanent.
 *
 *  2. **Phase 3 baseline** — inherited contrast gaps from the upstream
 *     Radical palette. Documented now so the build gate works against
 *     regressions; a future palette refresh (planned for v0.2.x) will
 *     either brighten these or formally accept them as identity choices.
 */
export type Exemption = {
  /** Slot name — must match the `name` of a ContrastPair. */
  name: string
  /** One-line justification. */
  reason: string
}

export const APCA_EXEMPTIONS: ReadonlyMap<string, Exemption> = new Map([
  // --- Design exemptions
  [
    'comment',
    {
      name: 'comment',
      reason: 'De-emphasized by design (italic gray) — Lc 30+ acceptable for non-content prose',
    },
  ],
  [
    'aiCompletionPreview',
    {
      name: 'aiCompletionPreview',
      reason: 'Ghost text — intentionally subtle so it does not compete with real code',
    },
  ],
  [
    'parameterAnnotation',
    {
      name: 'parameterAnnotation',
      reason: 'Inlay hints — italic, low-mid contrast by design',
    },
  ],
  [
    'fgPlaceholder',
    {
      name: 'fgPlaceholder',
      reason: 'Placeholder/disabled foreground — meant to read as inactive',
    },
  ],
  // --- Phase 3 baseline (inherited from upstream Radical; revisit for v0.2.x palette refresh)
  [
    'keyword',
    {
      name: 'keyword',
      reason: 'Phase 3 baseline — iconic Radical pink (#d5358f); brightening would change brand identity',
    },
  ],
  [
    'markup',
    {
      name: 'markup',
      reason: 'Phase 3 baseline — Lc 58 is 2 points below threshold; safe to brighten in palette refresh',
    },
  ],
  [
    'storage',
    {
      name: 'storage',
      reason: 'Phase 3 baseline — secondary pink (#F37AB0) ties to keyword identity; revisit with palette',
    },
  ],
  [
    'support',
    {
      name: 'support',
      reason: 'Phase 3 baseline — muted teal (#7cb3b6); brightening should pair with other gray-teals',
    },
  ],
  [
    'fgMuted',
    {
      name: 'fgMuted',
      reason: 'Phase 3 baseline — Lc 58 (gray-blue #94b4c4); 2 points under, brighten in palette refresh',
    },
  ],
  [
    'error',
    {
      name: 'error',
      reason: 'Phase 3 baseline — saturated red (#ff1767); APCA penalizes saturated reds, retain for status visibility',
    },
  ],
  [
    'vcs.deleted',
    {
      name: 'vcs.deleted',
      reason: 'Phase 3 baseline — close to threshold (Lc 41 vs 45); used in narrow gutter strips, accept',
    },
  ],
])

export function isExempt(name: string): boolean {
  return APCA_EXEMPTIONS.has(name)
}
