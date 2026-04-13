/**
 * CharSplitter — reusable per-character scroll animation framework
 *
 * USAGE:
 *   1. Add `data-splitfly="unique-id"` to any text element in HTML.
 *   2. Call `splitElement(el)` to split its text into per-char spans.
 *      Returns { el, chars, words } for animation.
 *   3. Use `buildFlyInTimeline(chars, trajectories)` /
 *      `buildFlyOutTimeline(chars, trajectories)` to build GSAP timelines,
 *      or use `splitFlyScroll(el, opts)` for full scroll-driven
 *      fly-in → hold → fly-out sequences.
 *
 * PRESETS (pass to computeTrajectories):
 *   'radial'  — chars explode outward from center (default)
 *   'rise'    — chars float upward with slight horizontal drift
 *   'fall'    — chars tumble downward
 *   'scatter' — pure random in all directions
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Detect CJK characters (Chinese/Japanese/Korean)
const CJK_RE = /[\u3000-\u9FFF\uF900-\uFAFF\u{20000}-\u{2FA1F}]/u;

/** Deterministic pseudo-random from a seed (mulberry32). */
export function seededRandom(seed: number): number {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export interface SplitResult {
  el: HTMLElement;
  chars: HTMLElement[];
  words: HTMLElement[];
}

/**
 * Split a DOM element's text into per-character <span>s.
 * Groups characters into word wrappers for natural line-breaking.
 */
export function splitElement(el: HTMLElement): SplitResult {
  const text = el.textContent || '';
  el.innerHTML = '';
  el.style.opacity = '1';

  const chars: HTMLElement[] = [];
  const words: HTMLElement[] = [];
  const segments = text.split(/(\s+)/);

  segments.forEach(seg => {
    if (/^\s+$/.test(seg)) {
      const sp = document.createElement('span');
      sp.className = 'sf-space';
      el.appendChild(sp);
    } else {
      const wordEl = document.createElement('span');
      wordEl.className = 'sf-word';
      for (const ch of seg) {
        const span = document.createElement('span');
        span.className = CJK_RE.test(ch) ? 'sf-char sf-char-cjk' : 'sf-char';
        span.textContent = ch;
        wordEl.appendChild(span);
        chars.push(span);
      }
      el.appendChild(wordEl);
      words.push(wordEl);
    }
  });

  return { el, chars, words };
}

export type TrajectoryPreset = 'radial' | 'rise' | 'fall' | 'scatter';

export interface Trajectory {
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
}

/**
 * Compute per-char fly targets based on preset.
 */
export function computeTrajectories(
  chars: HTMLElement[],
  preset: TrajectoryPreset = 'radial',
  intensity: number = 1,
): Trajectory[] {
  const count = chars.length;
  const mid = (count - 1) / 2;

  return chars.map((_, i) => {
    const seed = i * 2654435761;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    const r3 = seededRandom(seed + 2);
    const norm = (i - mid) / Math.max(mid, 1); // -1 to 1

    switch (preset) {
      case 'radial': {
        const angle = norm * Math.PI * 0.6 + (r1 - 0.5) * 0.8;
        const dist = (80 + r2 * 120) * intensity;
        return {
          x: Math.cos(angle) * dist * (norm < 0 ? -1 : 1),
          y: (r3 - 0.5) * 80 * intensity - 30 * intensity,
          z: (r1 - 0.3) * 150 * intensity,
          rotation: norm * 45 * intensity + (r2 - 0.5) * 30,
          scale: 0.3 + r3 * 0.4,
        };
      }
      case 'rise':
        return {
          x: norm * 40 * intensity + (r1 - 0.5) * 30,
          y: -(60 + r2 * 80) * intensity,
          z: (r1 - 0.5) * 60 * intensity,
          rotation: (r3 - 0.5) * 20 * intensity,
          scale: 0.5 + r1 * 0.3,
        };
      case 'fall':
        return {
          x: norm * 50 * intensity + (r1 - 0.5) * 40,
          y: (60 + r2 * 100) * intensity,
          z: (r3 - 0.5) * 80 * intensity,
          rotation: norm * 35 * intensity,
          scale: 0.4 + r2 * 0.3,
        };
      case 'scatter':
      default:
        return {
          x: (r1 - 0.5) * 300 * intensity,
          y: (r2 - 0.5) * 200 * intensity,
          z: (r3 - 0.5) * 200 * intensity,
          rotation: (r1 - 0.5) * 90 * intensity,
          scale: 0.2 + r2 * 0.5,
        };
    }
  });
}

/**
 * GSAP timeline: chars fly FROM scattered TO assembled (readable).
 */
export function buildFlyInTimeline(
  chars: HTMLElement[],
  trajectories: Trajectory[],
  opts: { stagger?: number; ease?: string } = {},
): gsap.core.Timeline {
  const { stagger = 0.02, ease = 'power3.out' } = opts;
  const tl = gsap.timeline();
  chars.forEach((ch, i) => {
    const t = trajectories[i];
    tl.fromTo(ch,
      { x: t.x, y: t.y, z: t.z, rotation: t.rotation, scale: t.scale, opacity: 0 },
      { x: 0, y: 0, z: 0, rotation: 0, scale: 1, opacity: 1, ease, duration: 1 },
      i * stagger,
    );
  });
  return tl;
}

/**
 * GSAP timeline: chars fly FROM assembled TO scattered.
 */
export function buildFlyOutTimeline(
  chars: HTMLElement[],
  trajectories: Trajectory[],
  opts: { stagger?: number; ease?: string } = {},
): gsap.core.Timeline {
  const { stagger = 0.02, ease = 'power3.in' } = opts;
  const tl = gsap.timeline();
  chars.forEach((ch, i) => {
    const t = trajectories[i];
    tl.to(ch,
      { x: t.x, y: t.y, z: t.z, rotation: t.rotation, scale: t.scale, opacity: 0, ease, duration: 1 },
      i * stagger,
    );
  });
  return tl;
}

/**
 * Full scroll-driven split-fly: fly-in → hold → fly-out.
 */
export function splitFlyScroll(
  el: HTMLElement,
  opts: {
    trigger?: string | HTMLElement;
    start?: string;
    end?: string;
    preset?: TrajectoryPreset;
    intensity?: number;
    inPreset?: TrajectoryPreset;
    outPreset?: TrajectoryPreset;
    holdRatio?: number;
  } = {},
) {
  const {
    trigger,
    start = 'top 80%',
    end = 'bottom 20%',
    preset = 'radial',
    intensity = 1,
    inPreset,
    outPreset,
    holdRatio = 0.3,
  } = opts;

  const { chars, words } = splitElement(el);
  const inTrajs = computeTrajectories(chars, inPreset || preset, intensity);
  const outTrajs = computeTrajectories(chars, outPreset || preset, intensity);

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger || el,
      start,
      end,
      scrub: 1.5,
    },
  });

  masterTl.add(buildFlyInTimeline(chars, inTrajs), 0);
  masterTl.add(buildFlyOutTimeline(chars, outTrajs), `>${holdRatio}`);

  return { chars, words, masterTl };
}

/**
 * Avoidance-based text split: chars repel away from a fixed element
 * (e.g. the hedgehog) as they scroll past it.
 */
export function splitAvoid(
  el: HTMLElement,
  opts: {
    avoidEl: HTMLElement;
    radius?: number;
    strength?: number;
    arc?: boolean;
    fadeEdge?: number;
    trigger?: string | HTMLElement;
  },
) {
  const {
    avoidEl,
    radius = 200,
    strength = 140,
    arc = true,
    fadeEdge = 0.3,
    trigger,
  } = opts;

  const { chars, words } = splitElement(el);

  let charOffsets: { relX: number; relY: number }[] | null = null;

  function measureChars() {
    const elRect = el.getBoundingClientRect();
    charOffsets = chars.map(ch => {
      const r = ch.getBoundingClientRect();
      return {
        relX: (r.left + r.width / 2) - elRect.left,
        relY: (r.top + r.height / 2) - elRect.top,
      };
    });
  }

  function update() {
    if (!charOffsets) {
      measureChars();
    }

    const avoidRect = avoidEl.getBoundingClientRect();
    const aCX = avoidRect.left + avoidRect.width / 2;
    const aCY = avoidRect.top + avoidRect.height / 2;
    const elRect = el.getBoundingClientRect();

    chars.forEach((ch, i) => {
      const off = charOffsets![i];
      const charVX = elRect.left + off.relX;
      const charVY = elRect.top + off.relY;

      const dx = charVX - aCX;
      const dy = charVY - aCY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius && dist > 0.1) {
        const factor = 1 - (dist / radius);
        const eased = factor * factor;
        const angle = Math.atan2(dy, dx);

        let pushX: number, pushY: number;
        if (arc) {
          const tangent = angle + Math.PI / 2 * (dx >= 0 ? 1 : -1);
          pushX = Math.cos(angle) * strength * eased
                + Math.cos(tangent) * strength * 0.35 * eased;
          pushY = Math.sin(angle) * strength * eased
                + Math.sin(tangent) * strength * 0.35 * eased;
        } else {
          pushX = Math.cos(angle) * strength * eased;
          pushY = Math.sin(angle) * strength * eased;
        }

        gsap.set(ch, {
          x: pushX,
          y: pushY,
          rotation: eased * (dx >= 0 ? 18 : -18),
          opacity: 1 - eased * (1 - fadeEdge),
          scale: 1 - eased * 0.15,
        });
      } else {
        gsap.set(ch, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1 });
      }
    });
  }

  const st = ScrollTrigger.create({
    trigger: trigger || el,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: update,
  });

  const onResize = () => { charOffsets = null; };
  window.addEventListener('resize', onResize);

  return {
    chars,
    words,
    update,
    kill: () => { st.kill(); window.removeEventListener('resize', onResize); },
  };
}
