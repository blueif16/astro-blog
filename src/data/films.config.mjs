// Promo films, by gallery project (the slug in work.config.mjs). Order is the order shown; the
// first one or two play in the gallery. `scripts/films/films.mjs` makes the web copies from each
// master and puts them in the R2 bucket `promos` (https://promos.infinityopus.com); the site reads
// what it uploaded from films.manifest.json. Masters stay on this machine and are never uploaded.
//
//   master   Path under ~/ae_playground/projects, or a full path.
//   crop     Optional ffmpeg crop taken off first, such as a screen recorder's border.
//   title    The film's own line where it has one.
//   kind     What sort of film it is.
//   loopAt   Second where the silent gallery loop (6 s) and the poster frame start.
//
// Only films already published go here: see `python3 -I ~/.claude/skills/publishing/scripts/publish.py --log`
// (and the older ~/.local/state/publishing/history.jsonl) for what went out.

export const mastersRoot = '/home/ran/ae_playground/projects';

export const films = {
  appify: [
    { id: 'same-website', title: 'Same website. Feels mobile.', kind: 'Launch film', master: 'appify-mg/exports/appify-mg_v001.mp4', loopAt: 6.5 },
    { id: 'at-a-desk', title: 'Nobody opens your app at a desk', kind: 'Motion graphics', master: 'appify-energy/exports/appify-energy_v001.mp4', loopAt: 8 },
    { id: 'everywhere-else', title: 'Ready for everywhere else', kind: 'Motion graphics', master: 'appify-energy-punch/exports/appify-energy-punch_v001.mp4', loopAt: 10 },
    { id: 'you-made-this', title: 'Wait, you made this?', kind: 'Short film', master: 'appify-made-this/exports/appify-made-this_v001.mp4', loopAt: 21 },
    { id: 'under-the-thumb', title: 'Put it under the thumb', kind: 'Animated short', master: 'appify-fitting/exports/appify-fitting_v001.mp4', loopAt: 1.5 },
    { id: 'phone-app', title: 'A website becomes a phone app', kind: 'Presenter film', master: 'appify-host/exports/appify-host_v004.mp4', loopAt: 31 },
  ],
  vas: [
    { id: 'cooking', title: 'Craft videos like cooking', kind: 'Launch film', master: 'base44-style-vas-launch/exports/film1_candidate.mp4', loopAt: 8 },
    { id: 'premium', title: 'What if every move felt premium?', kind: 'Motion graphics', master: 'vas-mg/exports/vas-mg_v002_rough.mp4', loopAt: 33 },
    { id: 'ink', title: 'Ink opening', kind: 'Opening film', master: 'vas-above-all/exports/checkpoints/C23_full_ae_v2.mp4', loopAt: 34 },
    { id: 'studio-charges', title: 'What a studio charges', kind: 'Presenter film', master: 'vas-host/incoming/sound/vas-host_v003_sound-3.mp4', loopAt: 42 },
  ],
  qingming: [
    { id: 'river-of-living-ink', title: 'River of Living Ink', kind: 'Trailer', master: 'qingming-promo/exports/qingming-promo_v003_4k-upload.mp4', loopAt: 1 },
  ],
  ice: [
    { id: 'sealed-in-a-castle', title: 'A story long sealed in a castle', kind: 'Trailer', master: 'ice-trailer/exports/ice_film_v002.mp4', loopAt: 32 },
    // A screen recording: the top 40 px are the recorder's magenta border.
    { id: 'played', title: 'Played in first person', kind: 'Gameplay', master: '/mnt/c/Users/ran/Videos/Screen Recordings/Screen Recording 2026-10-31 092111.mp4', crop: 'iw:ih-40:0:40', loopAt: 108 },
  ],
  'agent-teams': [
    { id: 'watch-them-work', title: 'Watch them work', kind: 'Launch film', master: 'agent-teams-assemble/exports/agent-teams-assemble_v004.mp4', loopAt: 23 },
    { id: 'say-it-once', title: 'Say it once.', kind: 'Launch film', master: 'agent-teams-control/exports/agent-teams-control_v005.mp4', loopAt: 22 },
    { id: 'it-remembers', title: 'Tap once. It remembers.', kind: 'Launch film', master: 'agent-teams-steer/exports/agent-teams-steer_v004.mp4', loopAt: 12 },
  ],
};
