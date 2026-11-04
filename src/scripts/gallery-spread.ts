// A project page.
//
// Live (the default): the real site runs in a frame the size of a desktop (1440 × 900) or a phone
// (393 × 852) browser window, scaled down to fit the picture's place, so it keeps its shape. The
// frame starts loading once this page has settled, and fades in over the picture when it has.
//
// Pictures (live: false in the config): the parts of a project play in turn. The line under the
// part showing is the timer (CSS); when it runs out the next part comes in. Pointing at the
// picture holds it; choosing a part stops the turns. #<part> in the address links to one part.
//
// Either way, ← and → go to the previous and next project and Escape goes back to the gallery.

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 393, height: 852 },
} as const;
type Device = keyof typeof VIEWPORTS;

// Safari has no requestIdleCallback.
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));

export function startSpread() {
  const spread = document.querySelector<HTMLElement>('[data-spread]');
  if (!spread) return;
  const band = spread.querySelector<HTMLElement>('[data-band]')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    // A film playing in its dialog has the keys: Escape closes it, arrows seek.
    if (document.querySelector('dialog[open]')) return;
    const to = { ArrowLeft: spread.dataset.previous, ArrowRight: spread.dataset.next, Escape: spread.dataset.home }[event.key];
    if (to) location.href = to;
  });

  const video = band.querySelector<HTMLVideoElement>('[data-video]');
  if (video && reduce.matches) {
    video.removeAttribute('autoplay');
    video.pause();
  }

  if (band.dataset.live) startLive(band);
  else startMoments(band, spread, reduce);
}

function startLive(band: HTMLElement) {
  const screen = band.querySelector<HTMLElement>('[data-screen]')!;
  const frame = screen.querySelector<HTMLIFrameElement>('[data-frame]')!;
  const buttons = [...band.querySelectorAll<HTMLButtonElement>('[data-device-to]')];
  let device: Device = 'desktop';

  // The frame is a full-size browser window; shrink it to the width it has on this page.
  const fit = () => screen.style.setProperty('--k', String(screen.clientWidth / VIEWPORTS[device].width));
  new ResizeObserver(fit).observe(screen);

  function use(next: Device) {
    device = next;
    const { width, height } = VIEWPORTS[next];
    band.dataset.device = next;
    screen.style.setProperty('--r', String(width / height));
    screen.style.setProperty('--vw', `${width}px`);
    screen.style.setProperty('--vh', `${height}px`);
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.deviceTo === next));
    fit();
  }
  for (const b of buttons) b.addEventListener('click', () => use(b.dataset.deviceTo as Device));

  // A phone is too narrow to show a desktop site at a size anyone could read.
  use(matchMedia('(max-width: 760px)').matches ? 'phone' : 'desktop');

  frame.addEventListener('load', () => {
    if (!frame.getAttribute('src')) return;
    screen.classList.add('is-live');
    band.classList.add('is-live');
  });
  const start = () => idle(() => frame.setAttribute('src', band.dataset.live!));
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}

function startMoments(band: HTMLElement, spread: HTMLElement, reduce: MediaQueryList) {
  const buttons = [...band.querySelectorAll<HTMLButtonElement>('[data-go]')];
  if (buttons.length < 2) return;
  const shots = new Map([...band.querySelectorAll<HTMLElement>('[data-moment]')].map((el) => [el.dataset.moment!, el]));
  const order = buttons.map((b) => b.dataset.go!);
  const noteOut = spread.querySelector<HTMLElement>('[data-note-out]');
  let current = order[0];
  let moving: Animation[] = [];

  function show(id: string, { animate = true } = {}) {
    if (!shots.has(id) || id === current) return;
    const incoming = shots.get(id)!;
    const outgoing = shots.get(current)!;
    const forward = order.indexOf(id) > order.indexOf(current);
    current = id;

    const button = buttons.find((b) => b.dataset.go === id)!;
    for (const b of buttons) b.setAttribute('aria-current', String(b === button));
    if (noteOut) {
      noteOut.textContent = button.dataset.note ?? '';
      noteOut.hidden = !button.dataset.note;
    }

    for (const a of moving) a.cancel();
    for (const shot of shots.values()) if (shot !== outgoing) shot.hidden = true;
    incoming.hidden = false;
    incoming.style.zIndex = '1';
    const finish = () => {
      if (current !== id) return;
      for (const shot of shots.values()) shot.hidden = shot !== incoming;
      incoming.style.zIndex = '';
    };
    if (!animate || reduce.matches) return finish();
    // The new part wipes in; the old one fades, since the two can be different shapes.
    const timing = { duration: 700, easing: 'cubic-bezier(0.76, 0, 0.24, 1)' };
    moving = [
      incoming.animate({ clipPath: [forward ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', 'inset(0 0 0 0)'] }, timing),
      outgoing.animate({ opacity: [1, 0] }, timing),
    ];
    moving[0].onfinish = finish;
  }

  const hold = () => band.classList.add('is-held');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      hold();
      show(button.dataset.go!);
      history.replaceState(history.state, '', `#${button.dataset.go}`);
    });
    // The timer under the part showing ran out: on to the next.
    button.addEventListener('animationend', () => {
      if (band.classList.contains('is-held')) return;
      show(order[(order.indexOf(current) + 1) % order.length]);
    });
  }

  // Fetch every part before it's needed, so a wipe never shows an empty frame.
  idle(() => {
    for (const shot of shots.values()) shot.querySelector('img')!.loading = 'eager';
  });

  const linked = decodeURIComponent(location.hash.slice(1));
  if (shots.has(linked)) {
    hold();
    show(linked, { animate: false });
  }
}
