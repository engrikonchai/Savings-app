/** Safe-area-aware spacing helpers. Every fixed/absolute element that sits near the top or
 * bottom edge (top bar, bottom nav, CTA bars) and every scroll container's edge padding
 * routes through these so nothing sits behind the Dynamic Island, the home indicator, or —
 * on a real device — the keyboard. */
export const pt = (px: number): string => `calc(${px}px + var(--safe-top))`;
export const pb = (px: number): string => `calc(${px}px + var(--safe-bottom))`;

export const TOPBAR_TOP = 60;
export const CONTENT_TOP_PAD = 104;
export const CONTENT_TOP_PAD_TIGHT = 22;
export const NAV_HEIGHT = 78;
export const CTA_HEIGHT = 54;
export const CTA_BOTTOM = 28;
