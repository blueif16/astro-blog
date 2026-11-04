// Slot letters: each glyph is a solid tile with narrow slots cut into it, after the carved title blocks of
// messenger.abeto.co. A tile is an 11 x 11 grid of cells, each cell 1 wide and 1.25 tall; strokes are 3 cells thick,
// slots 1 cell. Cuts are [x0, y0, x1, y1] cell ranges, inclusive, counted from the top-left.
export const COLS = 11, ROWS = 11, CELL_H = 1.25;
export const TILE_W = COLS, TILE_H = ROWS * CELL_H;

const RING = [[3, 3, 7, 3], [3, 7, 7, 7], [3, 3, 3, 7], [7, 3, 7, 7]];
const CUTS = {
  A: [[3, 3, 7, 3], [3, 7, 7, 10]],
  B: [[3, 3, 7, 3], [3, 7, 7, 7], [8, 5, 10, 5]],
  C: [[3, 4, 10, 6]],
  D: [[5, 3, 5, 7], [9, 0, 10, 0], [10, 1, 10, 1], [9, 10, 10, 10], [10, 9, 10, 9]],
  E: [[3, 3, 10, 3], [3, 7, 10, 7]],
  F: [[3, 3, 10, 3], [3, 7, 10, 10]],
  G: [[3, 3, 10, 3], [3, 3, 3, 7], [3, 7, 7, 7]],
  H: [[5, 0, 5, 3], [5, 7, 5, 10]],
  I: [[0, 3, 2, 7], [8, 3, 10, 7]],
  J: [[0, 0, 7, 4], [3, 5, 7, 7]],
  K: [[3, 0, 3, 4], [3, 6, 3, 10], [6, 5, 10, 5]],
  L: [[3, 0, 10, 7]],
  M: [[3, 3, 3, 10], [7, 3, 7, 10]],
  N: [[5, 3, 5, 10]],
  O: RING,
  P: [[3, 3, 7, 3], [3, 7, 10, 10]],
  Q: [...RING, [7, 8, 7, 10]],
  R: [[3, 3, 7, 3], [8, 5, 10, 5], [3, 7, 6, 10]],
  S: [[3, 3, 10, 3], [0, 7, 7, 7]],
  T: [[0, 3, 3, 10], [7, 3, 10, 10]],
  U: [[5, 0, 5, 7]],
  V: [[5, 0, 5, 7], [0, 8, 2, 10], [8, 8, 10, 10]],
  W: [[3, 0, 3, 7], [7, 0, 7, 7]],
  X: [[5, 0, 5, 3], [5, 7, 5, 10], [0, 5, 3, 5], [7, 5, 10, 5]],
  Y: [[5, 0, 5, 4], [0, 6, 3, 10], [7, 6, 10, 10]],
  Z: [[0, 3, 7, 3], [3, 7, 10, 7]],
  0: [[5, 3, 5, 7]],
  1: [[0, 3, 3, 7], [7, 0, 10, 7]],
  3: [[0, 3, 7, 3], [0, 7, 7, 7]],
  4: [[5, 0, 5, 3], [0, 7, 6, 10]],
  6: [[3, 3, 10, 3], [3, 7, 7, 7]],
  7: [[0, 3, 6, 10]],
  8: [[3, 3, 7, 3], [3, 7, 7, 7], [0, 5, 2, 5], [8, 5, 10, 5]],
  9: [[3, 3, 7, 3], [0, 7, 7, 7]],
  "-": [[0, 0, 10, 3], [0, 7, 10, 10]],
  ".": [[0, 0, 10, 7], [0, 8, 3, 10], [7, 8, 10, 10]],
  "'": [[0, 4, 10, 10], [0, 0, 3, 3], [7, 0, 10, 3]],
  "!": [[0, 0, 3, 10], [7, 0, 10, 10], [4, 7, 6, 7]],
};
const SAME = { 2: "Z", 5: "S" };

export const hasGlyph = (ch) => (SAME[ch.toUpperCase()] ?? ch.toUpperCase()) in CUTS;

// The glyph's cells as rows of 1 (solid) and 0 (cut), top row first; null for a character we don't draw.
export function cells(ch) {
  const key = SAME[ch.toUpperCase()] ?? ch.toUpperCase();
  if (!(key in CUTS)) return null;
  const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(1));
  for (const [x0, y0, x1, y1] of CUTS[key]) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = 0;
  return grid;
}

// The outline of the solid cells as closed loops in tile units: x right, y up, origin at the tile's centre.
// Outer loops run counter-clockwise and holes clockwise; each hole is listed under the outer loop around it.
export function outline(ch) {
  const grid = cells(ch);
  if (!grid) return [];
  const solid = (x, y) => y >= 0 && y < ROWS && x >= 0 && x < COLS && grid[y][x] === 1;
  // Boundary edges on the lattice (X right, Y up), with the solid side on the left.
  const from = new Map();
  const add = (a, b) => { const k = a.join(); if (!from.has(k)) from.set(k, []); from.get(k).push(b); };
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!solid(x, y)) continue;
    const X = x, Y = ROWS - 1 - y;
    if (!solid(x, y + 1)) add([X, Y], [X + 1, Y]);
    if (!solid(x + 1, y)) add([X + 1, Y], [X + 1, Y + 1]);
    if (!solid(x, y - 1)) add([X + 1, Y + 1], [X, Y + 1]);
    if (!solid(x - 1, y)) add([X, Y + 1], [X, Y]);
  }
  const loops = [];
  while (from.size) {
    const start = from.keys().next().value.split(",").map(Number);
    const pts = [];
    let cur = start, dir = null;
    do {
      const key = cur.join(), list = from.get(key);
      // Where two loops touch at a corner, turn left to stay on the same loop.
      let i = 0;
      if (dir && list.length > 1) {
        const rank = ([nx, ny]) => { const dx = nx - cur[0], dy = ny - cur[1]; return dx === -dir[1] && dy === dir[0] ? 0 : dx === dir[0] && dy === dir[1] ? 1 : 2; };
        i = list.reduce((best, p, j) => (rank(p) < rank(list[best]) ? j : best), 0);
      }
      const next = list.splice(i, 1)[0];
      if (!list.length) from.delete(key);
      pts.push(cur);
      dir = [next[0] - cur[0], next[1] - cur[1]];
      cur = next;
    } while (cur[0] !== start[0] || cur[1] !== start[1]);
    // Keep the corners only.
    const corners = pts.filter((p, j) => {
      const a = pts[(j + pts.length - 1) % pts.length], b = pts[(j + 1) % pts.length];
      return (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) !== 0;
    });
    loops.push(corners.map(([X, Y]) => [X - COLS / 2, (Y - ROWS / 2) * CELL_H]));
  }
  const area = (l) => l.reduce((s, [x, y], j) => { const [u, v] = l[(j + 1) % l.length]; return s + x * v - u * y; }, 0) / 2;
  const inside = ([px, py], l) => {
    let hit = false;
    for (let j = 0, k = l.length - 1; j < l.length; k = j++) {
      const [xj, yj] = l[j], [xk, yk] = l[k];
      if ((yj > py) !== (yk > py) && px < ((xk - xj) * (py - yj)) / (yk - yj) + xj) hit = !hit;
    }
    return hit;
  };
  const outers = loops.filter((l) => area(l) > 0).map((points) => ({ points, holes: [], area: area(points) }));
  for (const hole of loops.filter((l) => area(l) < 0)) {
    const [[ax, ay], [bx, by]] = hole, mid = [(ax + bx) / 2, (ay + by) / 2];
    const around = outers.filter((o) => inside(mid, o.points)).sort((a, b) => a.area - b.area)[0];
    around?.holes.push(hole);
  }
  return outers.map(({ points, holes }) => ({ points, holes }));
}
