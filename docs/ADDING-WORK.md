# Adding a product

One entry gives a product its gallery card and its page at `/work/<slug>`. Notes and films are optional. The gallery's order is the config's order.

## 1. The entry: `src/data/work.config.mjs`

A website. Its pictures are taken from the live site:

```js
{
  slug: 'my-app',                                  // its page is /work/my-app; keep it once set
  url: 'https://my-app.vercel.app/',
  title: 'My App',
  about: 'What it is, in one or two sentences.',
  stack: ['Next.js', 'Three.js'],
  repo: 'https://github.com/blueif16/my-app',      // public repos only
  moments: [                                       // the pictures; the first is the cover
    { id: 'home', name: 'Home' },
    { id: 'search', name: 'Search', steps: [{ click: 'button:has-text("Go")', wait: 1500 }] },
    { id: 'phone', name: 'On a phone', device: 'phone' },
  ],
},
```

Not a website, such as a game or a 3D world a script can't walk through: leave out `url` and give stills.

```js
{
  slug: 'my-game',
  title: 'My Game',
  about: '…',
  stack: ['Godot'],
  moments: [{ id: 'cover', name: 'Title screen', still: 'scripts/capture/stills/my-game/cover.webp' }],
},
```

A still is a 16:10 WebP, up to 2400 × 1500, kept in `scripts/capture/stills/<slug>/`. To make one from a frame:
`ffmpeg -i frame.png -vf "crop=ih*16/10:ih,scale='min(2400,iw)':-2" -c:v libwebp -quality 92 cover.webp`

Every other field (`live`, `once`, `at`, `hide`, `wait`, `motion`, …) is described at the top of the config.

Then take the pictures: `node scripts/capture/capture.mjs --only=my-app`

## 2. Notes on its page (optional): `src/data/design/<slug>.json`

```json
{
  "features": {
    "title": "A short heading",
    "intro": "One or two sentences.",
    "items": [{ "name": "Search", "text": "What it does and how it works.", "shot": "search" }]
  },
  "places": { "title": "…", "items": [] }
}
```

`shot` is a moment's `id`. Lead with the features and keep them light. `places` has the same shape and suits worlds and games. The other sections are typed in `src/data/design.ts`.

## 3. Promo films (optional): `src/data/films.config.mjs`

Only films that have already been published: `python3 -I ~/.claude/skills/publishing/scripts/publish.py --log` lists them.

```js
'my-app': [
  { id: 'launch', title: 'The film’s own line', kind: 'Launch film', master: 'my-app-promo/exports/my-app_v001.mp4', loopAt: 8 },
],
```

- `master`: a path under `~/ae_playground/projects`, or a full path.
- `loopAt`: the second where the 6-second gallery loop and the poster start.
- `crop` (optional): trims a border, such as a screen recorder's.

Then run `node scripts/films/films.mjs --only=my-app`. It makes a 1080p copy, the loop and a poster, and uploads them to the R2 bucket `promos`, which serves https://promos.infinityopus.com. Masters stay on this machine. The script refuses an upload that would take the bucket past 5 GB.

## 4. Publish

Commit and push to `main`. Vercel builds https://me.infinityopus.com from it:

- `/` is the Boardwalk park. After the park changes, run `bash scripts/boardwalk/sync.sh`.
- `/work` is the gallery.
- `/blog` and `/feed` are the blog and the daily briefing.

To check a change first, run `npx astro build`.
