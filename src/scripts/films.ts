// Promo films. On the detail page each film is a poster that plays its silent six-second loop while
// the pointer is on it, and opens the whole film, with sound, in a dialog when clicked. In the
// gallery, the project in the middle plays its first loops (see setFilmsPlaying, called by the index).
// With reduced motion nothing plays by itself; the posters stay.

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function play(video: HTMLVideoElement) {
  if (reduce()) return;
  if (video.preload === 'none') video.preload = 'auto';
  video.play().catch(() => {});
}

function stop(video: HTMLVideoElement) {
  video.pause();
}

export function startFilms() {
  const player = document.querySelector<HTMLDialogElement>('[data-player]');
  const big = player?.querySelector<HTMLVideoElement>('[data-player-video]');
  const title = player?.querySelector<HTMLElement>('[data-player-title]');

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-film]')) {
    const loop = button.querySelector<HTMLVideoElement>('[data-film-loop]');
    if (loop) {
      button.addEventListener('pointerenter', () => play(loop));
      button.addEventListener('pointerleave', () => stop(loop));
      button.addEventListener('focus', () => play(loop));
      button.addEventListener('blur', () => stop(loop));
      loop.addEventListener('playing', () => button.classList.add('is-playing'));
      loop.addEventListener('pause', () => button.classList.remove('is-playing'));
    }
    button.addEventListener('click', () => {
      if (!player || !big) return;
      loop && stop(loop);
      big.src = button.dataset.film!;
      if (title) title.textContent = button.dataset.title ?? '';
      player.showModal();
      big.play().catch(() => {});
    });
  }

  if (!player || !big) return;
  player.querySelector('[data-player-close]')?.addEventListener('click', () => player.close());
  // A click on the dark surround, not on the film or its bar, closes it too.
  player.addEventListener('click', (event) => {
    if (event.target === player) player.close();
  });
  player.addEventListener('close', () => {
    big.pause();
    big.removeAttribute('src');
    big.load();
  });
}

/** The gallery: loops in the active caption play, all others stop. */
export function setFilmsPlaying(active: Element | null) {
  for (const video of document.querySelectorAll<HTMLVideoElement>('[data-caption-loop]')) {
    if (active?.contains(video)) play(video);
    else stop(video);
  }
}
