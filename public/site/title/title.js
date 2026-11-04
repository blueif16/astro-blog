// The landing title: the name as extruded slot-letter blocks over the sea in the bottom-left corner, a handwritten
// line under it and an Explore button, after the title screen of messenger.abeto.co.
//
// mountTitle(root, { params }) reads its words from the markup: the name from root's <h1> (?name= overrides it), the
// line from .note, the button label from .explore. The blocks and the button are drawn in one WebGL canvas behind
// the real elements; the <h1> stays for screen readers and the <a class="explore"> takes the clicks and the focus.
// Clicking Explore fires an "explore" event on window; the page transition hangs off that.
//
// Blocks: cream faces, tinted walls, ink edges that stay the same width on screen, and a small stepped wobble three
// times a second so the edges look hand-drawn. Hovering a block bounces it; swiping across one spins it a full turn
// the way the pointer went; tapping one spins it too.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { gsap } from "gsap";
import { outline, hasGlyph, TILE_W, TILE_H } from "./glyphs.js";

const COLORS = {
  face: "#fbf3e3", wall: "#e98a6c", ink: "#2c201b",
  button: "#f7c75a", buttonWall: "#de8f3c", label: "#fff8ec", labelShadow: "#94601f",
};
const DEPTH = 0.55 * TILE_W;   // block depth in tile units
const FOV = 40;                // the camera hangs over the middle of the window
const WOBBLE = 0.03;           // radians, re-rolled three times a second

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Faces that look at the camera take `face`, faces seen edge-on take `wall`, so a block darkens as it turns.
function facingMaterial(face, wall) {
  return new THREE.ShaderMaterial({
    uniforms: { uFace: { value: new THREE.Color(face) }, uWall: { value: new THREE.Color(wall) } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uFace;
      uniform vec3 uWall;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float facing = abs(dot(normalize(vNormal), normalize(vView)));
        gl_FragColor = vec4(mix(uWall, uFace, smoothstep(0.35, 0.85, facing)), 1.0);
        #include <colorspace_fragment>
      }`,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
}

function glyphShapes(ch) {
  return outline(ch).map(({ points, holes }) => {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    shape.holes = holes.map((h) => new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
    return shape;
  });
}

function edges(geometry, material) {
  const g = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geometry, 20));
  return new LineSegments2(g, material);
}

export async function mountTitle(root, { params = new URLSearchParams(location.search) } = {}) {
  const heading = root.querySelector("h1");
  if (params.get("name")) heading.textContent = params.get("name");
  const name = heading.textContent.trim().toUpperCase();
  const note = root.querySelector(".note");
  const link = root.querySelector(".explore");
  const label = link.textContent.trim().toUpperCase();
  const canvas = root.querySelector("canvas");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10000);
  const ink = new LineMaterial({ color: new THREE.Color(COLORS.ink), linewidth: 2 });
  const tileMat = facingMaterial(COLORS.face, COLORS.wall);
  let dirty = true;
  const touch = () => { dirty = true; };
  const tween = (target, vars) => gsap.to(target, { ...vars, onUpdate: touch });

  // One geometry per letter, built in tile units and centred on the block's middle.
  const geoms = new Map();
  const geometry = (ch) => {
    if (!geoms.has(ch)) {
      const g = new THREE.ExtrudeGeometry(glyphShapes(ch), { depth: DEPTH, bevelEnabled: false, curveSegments: 1 });
      g.translate(0, 0, -DEPTH / 2);
      geoms.set(ch, g);
    }
    return geoms.get(ch);
  };

  // A part is a pivot (placed, spun and scaled by the layout and the tweens) holding a wobble group.
  function part(object) {
    const pivot = new THREE.Group(), wobble = new THREE.Group();
    wobble.add(object);
    pivot.add(wobble);
    scene.add(pivot);
    return { pivot, wobble, home: new THREE.Vector3(), from: new THREE.Vector3(), anim: { fly: 1, scale: 1, pop: 1, rx: 0, ry: 0 } };
  }

  const words = name.split(/\s+/).filter(Boolean).map((w) => [...w].filter(hasGlyph)).filter((w) => w.length);
  const tiles = [];
  words.forEach((word, row) => word.forEach((ch, col) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geometry(ch), tileMat), edges(geometry(ch), ink));
    tiles.push({ ...part(g), ch, row, col, rect: null });
  }));

  // The button: a square prism that turns a quarter at a time. The label stays on the front and blinks out while
  // the box turns under it, so every face looks like the front once it arrives.
  const btnMat = facingMaterial(COLORS.button, COLORS.buttonWall);
  const labelMat = new THREE.MeshBasicMaterial({ color: COLORS.label });
  const labelShadowMat = new THREE.MeshBasicMaterial({ color: COLORS.labelShadow });
  const button = (() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const spinner = new THREE.Group();
    spinner.add(new THREE.Mesh(box, btnMat), edges(box, ink));
    // Label in tile units: glyphs side by side, centred, each over a brown copy nudged down and right.
    const step = TILE_W + 2.4, width = label.length * step - 2.4;
    const glyphs = new THREE.Group();
    [...label].forEach((ch, i) => {
      if (!hasGlyph(ch)) return;
      const geo = new THREE.ShapeGeometry(glyphShapes(ch));
      const x = -width / 2 + TILE_W / 2 + i * step;
      const shadow = new THREE.Mesh(geo, labelShadowMat);
      shadow.position.set(x + 1, -1, -0.01);
      const face = new THREE.Mesh(geo, labelMat);
      face.position.set(x, 0, 0);
      glyphs.add(shadow, face);
    });
    const g = new THREE.Group();
    g.add(spinner, glyphs);
    return { ...part(g), spinner, glyphs, labelWidth: width, turn: 0, show: 1 };
  })();

  // Layout, in CSS px with y down; the scene uses x right, y up and 1 unit = 1 px on the front plane.
  const L = {};
  function layout() {
    const vw = innerWidth, vh = innerHeight;
    const cols = Math.max(1, ...words.map((w) => w.length)), rows = Math.max(1, words.length);
    const margin = clamp(Math.min(vw, vh) * 0.05, 16, 56);
    const narrow = vw < 640, short = vh < 500;
    const gapK = 0.18, rowK = 0.2;
    // Phones: the full width. Wider screens: about a third of a landscape window, more of a portrait one, and never
    // wider than the window is tall allows, so ultrawide screens keep the name on the sea.
    const maxW = narrow ? vw - 2 * margin : Math.min(vw * (vw > vh ? 0.32 : 0.6), vh * 0.6, 640);
    let tw = Math.min(maxW / (cols + (cols - 1) * gapK), 128);
    const stack = (t) => {
      const th = t * TILE_H / TILE_W;
      const noteSize = clamp(t * 0.32, short ? 14 : 17, 30), btnH = clamp(t * 0.62, short ? 34 : 42, 66);
      return { th, noteSize, btnH, height: rows * th + (rows - 1) * th * rowK + noteSize * 2.2 + btnH * 1.35 };
    };
    // Keep the whole stack in the lower half of the window.
    const budget = vh * (narrow ? 0.46 : 0.48) - margin;
    while (stack(tw).height > budget && tw > 18) tw *= 0.96;
    const { th, noteSize, btnH } = stack(tw);
    const gap = tw * gapK, rowGap = th * rowK;
    const tilesH = rows * th + (rows - 1) * rowGap;
    const bottom = vh - margin;
    const btnTop = bottom - btnH;
    const noteTop = btnTop - btnH * 0.35 - noteSize * 1.85;
    const tilesTop = noteTop - noteSize * 0.35 - tilesH;
    const s = tw / TILE_W;
    Object.assign(L, { vw, vh, tw, th, s, margin });
    for (const t of tiles) {
      const x = margin + t.col * (tw + gap), y = tilesTop + t.row * (th + rowGap);
      t.rect = { x, y, w: tw, h: th };
      t.home.set(x + tw / 2, -(y + th / 2), -DEPTH * s / 2);
    }
    const bw = (button.labelWidth * (btnH * 0.36 / TILE_H)) + btnH * 1.2;
    button.rect = { x: margin, y: btnTop, w: bw, h: btnH };
    button.home.set(margin + bw / 2, -(btnTop + btnH / 2), -btnH / 2);
    button.size = { w: bw, h: btnH, label: btnH * 0.36 / TILE_H };
    // Everything flies in from the middle of the block of tiles.
    const blockW = cols * tw + (cols - 1) * gap;
    const centre = new THREE.Vector3(margin + blockW / 2, -(tilesTop + tilesH / 2), -DEPTH * s / 2);
    for (const t of tiles) t.from.copy(centre);
    button.from.copy(button.home);

    Object.assign(note.style, { left: `${margin}px`, top: `${noteTop}px`, fontSize: `${noteSize}px` });
    Object.assign(link.style, { left: `${margin}px`, top: `${btnTop}px`, width: `${bw}px`, height: `${btnH}px` });

    // The canvas covers the corner with room for spins and bounces; the camera sees the whole window, so the
    // blocks show their tops and inner sides as if seen from the middle of the screen.
    const pad = tw * 0.7;
    const cw = Math.min(vw, margin + Math.max(blockW, bw) + pad), top = Math.max(0, tilesTop - pad);
    const ch = vh - top;
    Object.assign(canvas.style, { left: "0px", top: `${top}px`, width: `${cw}px`, height: `${ch}px` });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(cw, ch, false);
    camera.aspect = vw / vh;
    camera.setViewOffset(vw, vh, 0, top, cw, ch);
    camera.position.set(vw / 2, -vh / 2, (vh / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    camera.near = camera.position.z * 0.5;
    camera.far = camera.position.z * 2;
    camera.updateProjectionMatrix();
    ink.resolution.set(cw, ch);
    ink.linewidth = clamp(tw * 0.022, 1.5, 3);
    touch();
  }

  function place(p, s) {
    const a = p.anim;
    p.pivot.position.lerpVectors(p.from, p.home, a.fly);
    p.pivot.rotation.set(a.rx, a.ry, 0);
    p.pivot.scale.setScalar(s * a.scale * a.pop);
  }
  function placeButton() {
    const b = button, { w, h, label: ls } = b.size;
    b.pivot.position.copy(b.home);
    b.pivot.rotation.set(b.anim.rx, 0, 0);
    b.pivot.scale.setScalar(b.anim.scale * b.anim.pop);
    b.spinner.rotation.x = b.turn;
    b.spinner.scale.set(w, h, h);
    b.glyphs.scale.set(ls, ls * b.show, 1);
    b.glyphs.position.z = h / 2 + 0.5;
  }

  // Wobble: every block (and the button) tips a little about a random axis, re-rolled three times a second.
  let step = -1;
  const axis = new THREE.Vector3();
  function wobble(t) {
    const k = Math.floor(t * 3);
    if (k === step || still) return;
    step = k;
    for (const p of [...tiles, button]) {
      axis.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      p.wobble.quaternion.setFromAxisAngle(axis, (p === button ? 0.6 : 1) * WOBBLE);
    }
    dirty = true;
  }

  function render() {
    wobble(performance.now() / 1000);
    if (!dirty) return;
    dirty = false;
    for (const t of tiles) place(t, L.s);
    placeButton();
    renderer.render(scene, camera);
  }

  // Pointer: hovering a block bounces it, leaving it spins it the way the pointer was going, tapping spins it.
  const drift = { x: 0, y: 0 }, last = { x: 0, y: 0 };
  let hovered = null, downAt = null;
  const at = (x, y) => tiles.find(({ rect: r }) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) ?? null;
  function pop(t) {
    tween(t.anim, { pop: 1.06, duration: 0.18, ease: "power2.out", overwrite: "auto",
      onComplete: () => tween(t.anim, { pop: 1, duration: 0.75, ease: "elastic.out(1, 0.6)" }) });
  }
  function spin(t, horizontal, sign) {
    if (still || !sign) return;
    const key = horizontal ? "ry" : "rx";
    const to = Math.round(t.anim[key] / (2 * Math.PI)) * 2 * Math.PI + sign * 2 * Math.PI;
    tween(t.anim, { [key]: to, duration: 2.4, ease: `elastic.out(1, ${(0.5 + Math.random() * 0.3).toFixed(2)})`, overwrite: "auto" });
    tween(t.anim, { pop: 0.9, duration: 0.35, ease: "power2.out", overwrite: "auto",
      onComplete: () => tween(t.anim, { pop: 1, duration: 1, ease: "elastic.out(1, 0.6)" }) });
  }
  function leave(t) {
    const horizontal = Math.abs(drift.x) >= Math.abs(drift.y);
    spin(t, horizontal, horizontal ? Math.sign(drift.x) : Math.sign(drift.y));
  }
  // The root is fixed to the window, so client coordinates are layout coordinates.
  function move(e) {
    drift.x = drift.x * 0.6 + (e.clientX - last.x); drift.y = drift.y * 0.6 + (e.clientY - last.y);
    last.x = e.clientX; last.y = e.clientY;
    const t = at(e.clientX, e.clientY);
    if (t === hovered) return;
    if (hovered) leave(hovered);
    hovered = t;
    if (t) pop(t);
  }
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", () => { if (hovered) leave(hovered); hovered = null; });
  canvas.addEventListener("pointerdown", (e) => {
    last.x = e.clientX; last.y = e.clientY; drift.x = drift.y = 0;
    move(e);
    downAt = { x: e.clientX, y: e.clientY, t: hovered };
  });
  canvas.addEventListener("pointerup", (e) => {
    if (downAt?.t && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 8) spin(downAt.t, true, Math.random() < 0.5 ? -1 : 1);
    downAt = null;
    if (e.pointerType !== "mouse") hovered = null;
  });

  // Button: hover turns it a quarter the way the pointer came in, press squashes it, click fires "explore".
  let enterY = 0;
  link.addEventListener("pointerenter", (e) => {
    const r = link.getBoundingClientRect();
    enterY = e.clientY < r.top + r.height / 2 ? 1 : -1;
    if (still) return;
    gsap.killTweensOf(button);
    tween(button, { turn: Math.round(button.turn / (Math.PI / 2)) * (Math.PI / 2) + enterY * Math.PI / 2, duration: 1.5, ease: "elastic.out(1, 0.9)" });
    tween(button, { show: 0, duration: 0.05, ease: "none",
      onComplete: () => tween(button, { show: 1, duration: 0.22, delay: 0.14, ease: "steps(4)" }) });
  });
  link.addEventListener("pointerdown", () => tween(button.anim, { pop: 0.94, duration: 0.06, ease: "none", overwrite: "auto" }));
  const release = () => tween(button.anim, { pop: 1, duration: 0.5, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
  link.addEventListener("pointerup", release);
  link.addEventListener("pointerleave", release);
  link.addEventListener("click", () => dispatchEvent(new CustomEvent("explore")));

  layout();
  addEventListener("resize", layout);
  gsap.ticker.add(render);

  // Before play(): everything hidden.
  for (const t of tiles) Object.assign(t.anim, { fly: 0, scale: 0 });
  button.anim.scale = 0;
  note.style.clipPath = "inset(-20% 100% -20% 0)";
  render();

  return {
    play(delay = 0.2) {
      root.dataset.shown = "1";
      if (still) {
        for (const t of tiles) Object.assign(t.anim, { fly: 1, scale: 1 });
        button.anim.scale = 1;
        note.style.clipPath = "none";
        touch();
        return;
      }
      tiles.forEach((t, i) => {
        const d = delay + 0.075 * i;
        t.anim.rx = (Math.random() - 0.5) * Math.PI * 2;
        t.anim.ry = (Math.random() - 0.5) * Math.PI * 2;
        tween(t.anim, { scale: 1, fly: 1, rx: 0, ry: 0, duration: 3, delay: d, ease: "elastic.out(1, 0.75)" });
      });
      const after = delay + 0.075 * tiles.length + 0.35;
      gsap.to(note, { clipPath: "inset(-20% 0% -20% 0)", duration: 1.1, delay: after, ease: "power2.inOut" });
      button.anim.rx = -Math.PI;
      tween(button.anim, { scale: 1, duration: 3.25, delay: after + 0.35, ease: "elastic.out(1, 0.9)" });
      tween(button.anim, { rx: 0, duration: 3.25, delay: after + 0.35, ease: "elastic.out(1, 0.5)" });
    },
    resize: layout,
  };
}
