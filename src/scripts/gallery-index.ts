// The index: a scroll view and a grid view of the same work.
//
// Scroll view, on screens wider than a phone: the pictures are placed by script. The page's own
// scroll (half a screen per picture) chooses which one sits in the middle; that one is largest and
// each step away is smaller, as in docs/design-references/scroll-view.png. Its name grows in the list
// on the left and its words show on the right. On phones it stays a plain column.
//
// Grid view: every picture on one screen when that leaves them big enough to read.

import { setFilmsPlaying } from './films';

const SIZES = [1, 0.66, 0.34, 0.2]; // width 0, 1, 2 and 3+ places from the middle, against the middle one
const GAP = 16;
const STEP = 0.5; // screens of scrolling per picture; matches --step in gallery.css
const RATIO = 1.6;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const pad = (n: number) => String(n).padStart(2, '0');

export function startIndex() {
  const root = document.documentElement;
  const scrollEl = document.querySelector<HTMLElement>('[data-scroll]');
  const gridEl = document.querySelector<HTMLElement>('[data-grid]');
  const tilesEl = document.querySelector<HTMLElement>('[data-tiles]');
  if (!scrollEl || !gridEl || !tilesEl) return;
  const [scroll, grid, tiles] = [scrollEl, gridEl, tilesEl];

  const frames = [...scroll.querySelectorAll<HTMLElement>('.frame')];
  const names = [...scroll.querySelectorAll<HTMLAnchorElement>('[data-name]')];
  const namesList = scroll.querySelector<HTMLElement>('[data-names]')!;
  const captions = [...scroll.querySelectorAll<HTMLElement>('[data-caption]')];
  const count = document.querySelector<HTMLElement>('[data-count]');
  const switches = [...document.querySelectorAll<HTMLButtonElement>('[data-view-to]')];
  const n = frames.length;

  const wide = matchMedia('(min-width: 761px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const inGrid = () => root.dataset.view === 'grid';
  const stepPx = () => innerHeight * STEP;

  // ── Scroll view ──────────────────────────────────────────────────────────────

  let on = false;
  let p = 0; // where the reel is drawn: 2.5 is halfway between the third and fourth picture
  let target = 0; // where the page's scroll says it should be
  let raf = 0;
  let active = -1;
  let jumpUntil = 0; // scrolls before this time are the browser restoring a position: no glide

  function widthAt(distance: number, big: number) {
    const a = Math.min(Math.abs(distance), SIZES.length - 1);
    const i = Math.floor(a);
    const next = SIZES[Math.min(i + 1, SIZES.length - 1)];
    return big * (SIZES[i] + (next - SIZES[i]) * (a - i));
  }

  function place() {
    const vw = root.clientWidth;
    const vh = innerHeight;
    const side = namesList.offsetWidth;
    const room = vw - 2 * (side + 56);
    const big = Math.max(220, Math.min(room, vh * 0.44 * RATIO));

    const w = frames.map((_, i) => widthAt(i - p, big));
    const h = w.map((x) => x / RATIO);
    const centre = [0];
    for (let i = 1; i < n; i++) centre[i] = centre[i - 1] + h[i - 1] / 2 + GAP + h[i] / 2;
    const k = clamp(Math.floor(p), 0, n - 1);
    const anchor = k + 1 < n ? centre[k] + (centre[k + 1] - centre[k]) * (p - k) : centre[k];

    frames.forEach((frame, i) => {
      const y = vh / 2 + centre[i] - anchor - h[i] / 2;
      const seen = y < vh + 40 && y + h[i] > -40;
      frame.style.visibility = seen ? '' : 'hidden';
      if (!seen) return;
      frame.style.width = `${w[i]}px`;
      frame.style.height = `${h[i]}px`;
      frame.style.transform = `translate3d(${(vw - w[i]) / 2}px, ${y}px, 0)`;
    });
    setActive(clamp(Math.round(p), 0, n - 1));
  }

  function setActive(i: number) {
    if (i === active) return;
    active = i;
    names.forEach((name, j) => name.setAttribute('aria-current', String(j === i)));
    captions.forEach((caption, j) => {
      caption.classList.toggle('is-on', j === i);
      caption.setAttribute('aria-hidden', String(j !== i));
      caption.querySelector('.caption-films')?.setAttribute('tabindex', j === i ? '0' : '-1');
    });
    setFilmsPlaying(on && !inGrid() ? captions[i] : null);
    if (count) count.textContent = `(${pad(i + 1)}/${pad(n)})`;
  }

  function tick() {
    const d = target - p;
    p = reduce.matches || Math.abs(d) < 0.002 ? target : p + d * 0.16;
    place();
    raf = p === target ? 0 : requestAnimationFrame(tick);
  }

  function onScroll() {
    target = clamp(scrollY / stepPx(), 0, n - 1);
    if (performance.now() < jumpUntil) p = target;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function go(i: number) {
    scrollTo({ top: clamp(i, 0, n - 1) * stepPx(), behavior: 'instant' });
  }

  function enable() {
    if (on || inGrid() || !wide.matches) return;
    on = true;
    scroll.classList.add('is-reel');
    p = target = clamp(scrollY / stepPx(), 0, n - 1);
    jumpUntil = performance.now() + 400;
    place();
    setFilmsPlaying(captions[active] ?? null);
    addEventListener('scroll', onScroll, { passive: true });
  }

  function disable() {
    if (!on) return;
    on = false;
    scroll.classList.remove('is-reel');
    removeEventListener('scroll', onScroll);
    cancelAnimationFrame(raf);
    raf = 0;
    for (const frame of frames) frame.removeAttribute('style');
    setFilmsPlaying(null);
  }

  names.forEach((name, i) => {
    name.addEventListener('click', (event) => {
      if (!on || i === active) return; // the name in the middle opens its page
      event.preventDefault();
      go(i);
    });
    name.addEventListener('focus', () => on && go(i));
  });
  frames.forEach((frame, i) => frame.addEventListener('focusin', () => on && go(i)));

  addEventListener('keydown', (event) => {
    if (!on || event.metaKey || event.ctrlKey || event.altKey || document.querySelector('dialog[open]')) return;
    const by = ({ ArrowDown: 1, ArrowUp: -1, j: 1, k: -1 } as Record<string, number>)[event.key];
    if (by) {
      event.preventDefault();
      go(active + by);
    } else if (event.key === 'Enter' && document.activeElement === document.body) {
      location.href = names[active].href;
    }
  });

  // ── Grid view ────────────────────────────────────────────────────────────────

  function fit() {
    if (!inGrid() || !wide.matches) return tiles.classList.remove('is-fit');
    const style = getComputedStyle(grid);
    const width = grid.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = innerHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const gapX = 24;
    const gapY = 22;
    const label = 21;
    let best = { cols: 0, tile: 0 };
    for (let cols = 2; cols <= 8; cols++) {
      const rows = Math.ceil(n / cols);
      const byWidth = (width - (cols - 1) * gapX) / cols;
      const byHeight = ((height - (rows - 1) * gapY) / rows - label) * RATIO;
      const tile = Math.min(byWidth, byHeight);
      if (tile > best.tile + 0.5) best = { cols, tile };
    }
    // Too many to fit at a size worth looking at: let the grid scroll instead.
    if (best.tile < 170) return tiles.classList.remove('is-fit');
    tiles.style.setProperty('--cols', String(best.cols));
    tiles.style.setProperty('--tile', `${Math.floor(best.tile)}px`);
    tiles.classList.add('is-fit');
  }

  // ── Switching views ──────────────────────────────────────────────────────────

  let reelScroll = 0;

  const onScreen = (img: HTMLElement) => {
    const box = img.getBoundingClientRect();
    return box.width > 0 && box.bottom > 0 && box.top < innerHeight && getComputedStyle(img.closest('li')!).visibility !== 'hidden';
  };
  const pictures = () =>
    [...document.querySelectorAll<HTMLImageElement>(inGrid() ? '.tile img' : '.frame img')].filter(onScreen);
  const nameAll = () => pictures().forEach((img) => (img.style.viewTransitionName = `shot-${img.dataset.slug}`));
  const clearNames = () => document.querySelectorAll<HTMLImageElement>('img[data-slug]').forEach((img) => (img.style.viewTransitionName = ''));

  function apply(view: 'scroll' | 'grid') {
    if (view === 'grid') {
      if (!inGrid()) reelScroll = scrollY;
      root.dataset.view = 'grid';
      disable();
      fit();
      scrollTo({ top: 0, behavior: 'instant' });
    } else {
      delete root.dataset.view;
      enable();
      scrollTo({ top: reelScroll, behavior: 'instant' });
      if (on) {
        p = target = clamp(reelScroll / stepPx(), 0, n - 1);
        place();
      }
    }
    switches.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.viewTo === view)));
  }

  function setView(view: 'scroll' | 'grid') {
    if ((view === 'grid') === inGrid()) return;
    try {
      localStorage.setItem('gallery-view', view);
    } catch {}
    const url = new URL(location.href);
    url.searchParams.delete('view');
    history.replaceState(history.state, '', url);

    if (!document.startViewTransition || reduce.matches) return apply(view);
    // The pictures on screen move to their places in the other view.
    nameAll();
    const transition = document.startViewTransition(() => {
      clearNames();
      apply(view);
      nameAll();
    });
    transition.finished.finally(clearNames);
  }

  switches.forEach((b) => b.addEventListener('click', () => setView(b.dataset.viewTo as 'scroll' | 'grid')));

  // ── Going to a project and coming back ─────────────────────────────────────────
  // The picture you clicked grows into the project page's picture, and back again.

  const slugIn = (url?: string | null) => (url ? new URL(url).pathname.match(/^\/work\/([^/]+)/)?.[1] : undefined);
  const pictureOf = (slug: string) => pictures().find((img) => img.dataset.slug === slug);

  addEventListener('pageswap', (event: any) => {
    const slug = slugIn(event.activation?.entry?.url);
    const img = event.viewTransition && slug && pictureOf(slug);
    if (img) img.style.viewTransitionName = `shot-${slug}`;
  });
  addEventListener('pageshow', (event) => event.persisted && clearNames());
  addEventListener('pagereveal', (event: any) => {
    if (!event.viewTransition) return;
    const slug = slugIn((window as any).navigation?.activation?.from?.url);
    const img = slug && pictureOf(slug);
    if (!img) return;
    img.style.viewTransitionName = `shot-${slug}`;
    event.viewTransition.finished.finally(clearNames);
  });

  // ── Start ───────────────────────────────────────────────────────────────────────

  switches.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.viewTo === 'grid') === inGrid())));

  // /work?at=<slug>, from a project page's masthead: come back to that piece.
  const params = new URLSearchParams(location.search);
  const at = params.get('at');
  const atIndex = at ? names.findIndex((name) => name.pathname === `/work/${at}`) : -1;
  if (at) {
    params.delete('at');
    history.replaceState(history.state, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
  }

  enable();
  fit();
  if (atIndex >= 0) {
    if (on) {
      go(atIndex);
      p = target = atIndex;
      place();
    } else if (inGrid()) {
      tiles.children[atIndex]?.scrollIntoView({ block: 'center' });
    }
  }

  let lastStep = stepPx();
  addEventListener('resize', () => {
    if (!wide.matches) disable();
    else if (!inGrid()) enable();
    fit();
    if (on) {
      // Keep the same picture in the middle when the window changes size.
      const keep = scrollY / lastStep;
      scrollTo({ top: keep * stepPx(), behavior: 'instant' });
      p = target = clamp(keep, 0, n - 1);
      place();
    }
    lastStep = stepPx();
  });
}
