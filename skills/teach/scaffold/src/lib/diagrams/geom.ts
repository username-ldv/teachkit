/**
 * Shared geometry and vocabulary for the SVG diagram library.
 *
 * Every diagram draws into a viewBox whose units are design pixels, and the
 * <svg> is stretched to the column width by .figure > svg. Font sizes in
 * diagram.css are therefore in the same units, which keeps labels legible
 * at the sizes these figures actually render at.
 */

/** The palette roles a diagram may paint with. Never a raw hex value. */
export type Tone =
  | 'plain'
  | 'accent'
  | 'green'
  | 'yellow'
  | 'red'
  | 'purple'
  | 'cyan'
  /** Deliberately quiet — a back-pointer, a link that is not the subject. */
  | 'faint';

/** Approximate advance width of the monospace face, as a fraction of font size. */
export const MONO_ADVANCE = 0.6;
/** Same, for the sans face — rough, but good enough to size boxes around text. */
export const SANS_ADVANCE = 0.53;

export function monoWidth(text: string, fontSize = 13): number {
  return text.length * fontSize * MONO_ADVANCE;
}

export function sansWidth(text: string, fontSize = 13): number {
  return text.length * fontSize * SANS_ADVANCE;
}

/** `class="box accent"` — tone `plain` adds nothing. */
export function toneClass(base: string, tone: Tone | undefined): string {
  return tone && tone !== 'plain' ? `${base} ${tone}` : base;
}

/** Text colour class for a tone: `accent-t`, `green-t`, … */
export function toneText(tone: Tone | undefined): string {
  return tone && tone !== 'plain' ? `${tone}-t` : '';
}

/** The arrowhead marker registered for this tone by ArrowDefs.svelte. */
export function arrowHead(tone: Tone | undefined): string {
  return `url(#ah-${tone && tone !== 'plain' ? tone : 'muted'})`;
}

export function arrowTail(tone: Tone | undefined): string {
  return `url(#at-${tone && tone !== 'plain' ? tone : 'muted'})`;
}

/**
 * An orthogonal connector: out of `from`, along a horizontal spine at `spineY`,
 * then into `to`. Used for the "skip over a node" arrows in list surgery and
 * for chain links that must dodge other boxes.
 */
export function elbow(
  from: { x: number; y: number },
  to: { x: number; y: number },
  spineY: number,
  radius = 6
): string {
  const dir = to.x >= from.x ? 1 : -1;
  const r = Math.min(radius, Math.abs(to.x - from.x) / 2, Math.abs(spineY - from.y) / 2);
  const vDir = spineY > from.y ? 1 : -1;
  return [
    `M ${from.x} ${from.y}`,
    `L ${from.x} ${spineY - r * vDir}`,
    `Q ${from.x} ${spineY} ${from.x + r * dir} ${spineY}`,
    `L ${to.x - r * dir} ${spineY}`,
    `Q ${to.x} ${spineY} ${to.x} ${spineY - r * vDir}`,
    `L ${to.x} ${to.y}`
  ].join(' ');
}

/** A gentle arc from one point to another, bulging by `lift` pixels. */
export function arc(
  from: { x: number; y: number },
  to: { x: number; y: number },
  lift: number
): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - lift;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

/** Points of a regular polygon vertex, used by the ring-buffer clock face. */
export function onCircle(cx: number, cy: number, r: number, turns: number) {
  const a = turns * Math.PI * 2 - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Round to 2dp so generated path strings stay readable in devtools. */
export const n2 = (v: number) => Math.round(v * 100) / 100;
