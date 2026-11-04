// Design notes for a project's detail page: src/data/design/<slug>.json. A project without a
// file simply has no notes. Every section is optional.

export interface ShotList {
  title: string;
  intro?: string;
  items: { name: string; text: string; shot?: string }[];
}

export interface DesignNotes {
  interface?: { title: string; body: string[]; shot?: string };
  palette?: { title: string; body: string; colors: { value: string; name: string; role: string }[] };
  type?: {
    title: string;
    body: string;
    faces: { family: string; google?: string; weight?: number; role: string; sample: string }[];
  };
  features?: ShotList;
  /** Places worth going to inside the work, for worlds and games. Laid out like the features. */
  places?: ShotList;
  /** New pictures to take for this project, merged into work.config.mjs by hand. */
  capture?: unknown[];
  sources?: string[];
}

const files = import.meta.glob<DesignNotes>('./design/*.json', { eager: true, import: 'default' });

export const designOf = (slug: string): DesignNotes | undefined => files[`./design/${slug}.json`];

/** One Google Fonts request for every face a page shows, cut down to the letters it uses. */
export function specimenFontsHref(notes?: DesignNotes) {
  const faces = notes?.type?.faces.filter((f) => f.google) ?? [];
  if (!faces.length) return undefined;
  const letters = [...new Set(['Aa', ...faces.map((f) => f.sample)].join(''))].join('');
  const families = [...new Set(faces.map((f) => f.google!))].map((f) => `family=${f}`).join('&');
  return `https://fonts.googleapis.com/css2?${families}&text=${encodeURIComponent(letters)}&display=swap`;
}

export interface Tile {
  x: number;
  y: number;
  size: number;
}

/**
 * Squares for a palette, laid out as a Fibonacci tiling: sizes 1, 1, 2, 3, 5, 8, each new square
 * set against the rectangle so far, turning right, down, left, up. The result is a rectangle whose
 * sides are neighbouring Fibonacci numbers, so it approaches the golden ratio. Returned largest
 * first, in units, with the whole rectangle `width` × `height`, always wider than tall.
 */
export function fibonacciTiles(count: number) {
  const tiles: Tile[] = [{ x: 0, y: 0, size: 1 }];
  let box = { x: 0, y: 0, w: 1, h: 1 };
  const sides = ['right', 'down', 'left', 'up'] as const;
  for (let i = 1; i < count; i++) {
    const side = sides[(i - 1) % 4];
    let tile: Tile;
    if (side === 'right') tile = { x: box.x + box.w, y: box.y, size: box.h };
    else if (side === 'down') tile = { x: box.x, y: box.y + box.h, size: box.w };
    else if (side === 'left') tile = { x: box.x - box.h, y: box.y, size: box.h };
    else tile = { x: box.x, y: box.y - box.w, size: box.w };
    tiles.push(tile);
    const x = Math.min(box.x, tile.x);
    const y = Math.min(box.y, tile.y);
    box = { x, y, w: Math.max(box.x + box.w, tile.x + tile.size) - x, h: Math.max(box.y + box.h, tile.y + tile.size) - y };
  }
  let placed = tiles.map((t) => ({ ...t, x: t.x - box.x, y: t.y - box.y }));
  let { w: width, h: height } = box;
  if (height > width) {
    placed = placed.map((t) => ({ x: t.y, y: t.x, size: t.size }));
    [width, height] = [height, width];
  }
  return { tiles: placed.reverse(), width, height };
}

/** Whether text on this colour should be dark. Gradients count as light. */
export function isLight(value: string) {
  const hex = value.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (!hex) return true;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.22;
}
