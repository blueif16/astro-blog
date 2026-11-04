// The frontend gallery. To add a frontend, add its URL here and push. That is all it needs:
//
//   { url: 'https://my-site.vercel.app/' },
//
// A GitHub Action (.github/workflows/capture-work.yml) then photographs it and takes its title
// and description from the page. It retakes the pictures by itself whenever
// the site gets a new production deployment. Order here is the order in the gallery.
//
// Everything else is optional:
//
//   (url itself can be left out for work with no website, such as a game, when every moment is
//   a `still`. Give it a `slug`; the detail page then shows pictures and films, no live site.)
//   slug      Address of the detail page, /work/<slug>. Default: first part of the hostname.
//             Set it once and keep it, so links to the page keep working.
//   title     Default: the page's <title>, up to the first separator.
//   about     What it is, one or two sentences. Default: the page's meta description.
//   why       Why it exists and what you're proud of. Yours to write; shows under `about`.
//   stack     What it is made of. Shows on the label and feeds the Stack view.
//   year      Default: the year the Vercel project was created.
//   liveHref  Where "Visit the live site" goes, when it differs from `url`.
//   repo      The code on GitHub. Shown as a link on the detail page; leave it out for private repos.
//   live      false shows pictures on the detail page instead of the live site. By default the
//             detail page runs the real site in a frame, scaled to fit, at desktop or phone size;
//             its picture shows while it loads. The gallery always uses pictures.
//   video     A screen recording (.mp4 or .webm, a path under public/ or a URL) to play on the
//             detail page instead of the pictures. The cover picture is its poster.
//
//   cover     Which moment's picture is the gallery tile. Default: the first.
//   moments   The pictures on the detail page, in order. Default: home screen, up to `sections`
//             sections found on the page (default 3), and a phone.
//             { id, name, note, device: 'desktop' | 'phone', steps, scrollTo, scrollY, wait }
//             `note` is shown beside the picture: say what's good about this part.
//             `steps` reach anything a scroll can't, one action per step:
//               { click: 'selector' } { hover: 'selector' } { press: 'Escape' } { scrollTo: 'selector' }
//             and each step can add { wait: ms }.
//             `once: true` takes that picture the first time and keeps it after, for screens that
//             cost something to reach, such as a run of a paid model.
//             `still: 'path/in/repo.webp'` uses that file instead of taking a picture, for views a
//             script can't reach, such as a camera placed inside a 3D world. Keep it 16:10.
//
//   ready     Wait for this selector before shooting, for pages with a long load.
//   scale     Picture sharpness, default 2 (phone 3). Use 1 for heavy WebGL pages that time out.
//   wait      Extra settle time in ms after load. Default 1500.
//   motion    true keeps the site's animations running. By default pictures ask for reduced
//             motion, which is steadier. Use it when the animation is the point.
//   at        Freeze the page's clock, for pages that change with the time of day.
//   hide      Selectors to hide from the pictures, such as cookie banners.
//   frozen    Take the pictures once and never again.

export const vercelTeamId = 'team_aMsUf0tmWRoapgVunPti4KO9';

export const slugOf = (entry) => entry.slug ?? new URL(entry.url).hostname.split('.')[0];

export const work = [
  {
    slug: 'boardwalk',
    url: 'https://boardwalk-alpha.vercel.app/',
    title: 'Boardwalk',
    about:
      'A living storybook map of the Santa Cruz Beach Boardwalk: the whole park repainted in pastel and fixed to fill the screen, with crowds, rides, water and the time of day moving on top.',
    stack: ['Three.js', 'WebGL', 'GPT Image'],
    motion: true,
    scale: 1,
    wait: 6000,
    at: '2026-07-01T17:00:00-07:00',
    moments: [
      { id: 'map', name: 'The map' },
      { id: 'night', name: 'After dark', steps: [{ click: '.sky-clock .badge', wait: 600 }, { click: '.sky-clock input[type=range]', wait: 600 }, { press: 'End', wait: 300 }, { press: 'PageDown', wait: 5000 }] },
      { id: 'corgi', name: 'Find the corgi', steps: [{ click: '.corgi-badge', wait: 1500 }] },
    ],
  },
  {
    slug: 'appify',
    url: 'https://appify-studio-zeta.vercel.app/',
    repo: 'https://github.com/blueif16/appify',
    title: 'appify',
    stack: ['No framework'],
    moments: [
      { id: 'hero', name: 'First screen' },
      {
        id: 'studio',
        name: 'Studio',
        steps: [{ click: '[data-sheet="studio"]' }],
        note: 'Long pages of sections feel generic, so this one stays on one screen. Studio and Skill open over it, full screen, and the tabs stay where they are.',
      },
      {
        id: 'skill',
        name: 'Skill',
        steps: [{ click: '[data-sheet="skill"]' }],
      },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
  },
  {
    slug: 'practice-studio',
    url: 'https://practice-studio-seven.vercel.app/',
    title: 'Practice Studio',
    about:
      'A coach for rehearsing a talk. Give it your notes or deck, the event, the time limit and the date; it drafts the story for you to approve, then plans your practice and times every run.',
    stack: ['No framework'],
    wait: 2500,
  },
  {
    slug: 'vas',
    url: 'https://vas.infinityopus.com/',
    title: 'VAS',
    stack: ['Next.js', 'React', 'shadcn/ui', 'Supabase', 'Better Auth'],
    moments: [
      { id: 'home', name: 'Home' },
      { id: 'search', name: 'Search', steps: [{ click: 'button:has-text("Tech promo")', wait: 4000 }] },
      { id: 'clip', name: 'A clip', steps: [{ click: 'a[href^="/clips/"]', wait: 2500 }, { click: 'button:has-text("Details")', wait: 1500 }] },
      { id: 'cart', name: 'Cart', steps: [{ click: 'button[aria-label="Add to cart"]', wait: 1200 }, { click: ':nth-match(button[aria-label="Add to cart"], 2)', wait: 1200 }, { click: ':nth-match(button[aria-label="Add to cart"], 3)', wait: 1200 }, { click: 'header button:has-text("Cart")', wait: 1500 }] },
      { id: 'docs', name: 'Connect an agent', steps: [{ click: 'header a[href="/docs"]', wait: 2000 }] },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
    wait: 3000,
  },
  {
    slug: 'qingming',
    url: 'https://qingming.infinityopus.com/',
    repo: 'https://github.com/blueif16/qingming',
    about: 'A walkable 清明上河图 in the browser.',
    stack: ['Three.js', 'Blender'],
    motion: true,
    scale: 1,
    wait: 4000,
    // The world's sun follows the visitor's clock, so pin it to an LA afternoon for the live shot.
    at: '2026-11-03T13:00:00-08:00',
    // Frames from the promo film's captures (ae_playground/projects/qingming-promo/capture), cut
    // from 16:9 to 16:10. A script can't place a camera inside the world, so these are kept files.
    moments: [
      { id: 'canal-sunset', name: 'Sunset on the Bian Canal', still: 'scripts/capture/stills/qingming/canal-sunset.webp' },
      { id: 'bridge', name: 'The Rainbow Bridge', still: 'scripts/capture/stills/qingming/bridge.webp' },
      { id: 'willows', name: 'Willows on the Sui Embankment', still: 'scripts/capture/stills/qingming/willows.webp' },
      { id: 'canal', name: 'The Bian Canal', still: 'scripts/capture/stills/qingming/canal.webp' },
      { id: 'crown', name: 'On the crown of the bridge', still: 'scripts/capture/stills/qingming/crown.webp' },
      { id: 'street', name: 'The bridge’s south foot', still: 'scripts/capture/stills/qingming/street.webp' },
      { id: 'storyteller', name: 'The Street Storyteller', still: 'scripts/capture/stills/qingming/storyteller.webp' },
      { id: 'tavern', name: 'Sun Yang’s Main Tavern', still: 'scripts/capture/stills/qingming/tavern.webp' },
      { id: 'sunset', name: 'The bridge at sunset', still: 'scripts/capture/stills/qingming/sunset.webp' },
      { id: 'painting', name: 'The painting', steps: [{ press: 'Space', wait: 5000 }] },
    ],
  },
  {
    // A game, not a website: no url, so its pictures are stills from the trailer
    // (ae_playground/projects/ice-trailer/exports/ice_film_v002.mp4), cut to 16:10.
    slug: 'ice',
    title: 'Ice: a story of fires',
    about:
      'A first-person game for two players in a palace sealed for a hundred years. One plays fire, the other ice, and each dies in the other’s element. Coming soon on Steam.',
    stack: ['Godot', 'Blender', 'Meshy'],
    moments: [
      { id: 'doors', name: 'Their two doors', still: 'scripts/capture/stills/ice/doors.webp' },
      { id: 'meet', name: 'Where fire and ice meet', still: 'scripts/capture/stills/ice/meet.webp' },
      { id: 'hall', name: 'The hall of lava and water', still: 'scripts/capture/stills/ice/hall.webp' },
      { id: 'couple', name: 'The king and queen', still: 'scripts/capture/stills/ice/couple.webp' },
      { id: 'sky', name: 'The gate to the sky', still: 'scripts/capture/stills/ice/sky.webp' },
    ],
  },
  {
    slug: 'omni-game',
    url: 'https://gallery-navy-chi.vercel.app/',
    title: 'Omni Game',
    moments: [
      { id: 'home', name: 'Home' },
      { id: 'kinds', name: 'Game kinds', steps: [{ click: '#howto-btn', wait: 1200 }, { click: '#tip-cta', wait: 1800 }, { click: ':nth-match(.rail-card, 3)', wait: 1200 }] },
      { id: 'ideas', name: 'Idea chooser', steps: [{ click: '#ideas-btn', wait: 1500 }, { click: '#arch-list > *', wait: 900 }, { click: ':nth-match(#style-list > *, 2)', wait: 900 }, { click: '#page-next', wait: 1200 }, { click: '#forge-spin', wait: 2500 }] },
      { id: 'gallery', name: 'Games built', steps: [{ click: '#others-btn', wait: 3500 }] },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
    wait: 2500,
  },
  {
    slug: 'agent-teams',
    url: 'https://agent-teams-mu.vercel.app/',
    repo: 'https://github.com/blueif16/agent-teams',
    about:
      'A cuter Slack for long-running agents: every channel is a team working toward one goal, and every agent has a mascot, a plan and a live status.',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Motion'],
    moments: [
      { id: 'home', name: 'Home' },
      { id: 'orders', name: 'Reactions are orders', steps: [{ click: 'text=Heads-up: the' }] },
      { id: 'mira', name: 'Mira, the CEO', steps: [{ click: '[aria-label="Mira, your CEO"]' }] },
      { id: 'charts', name: 'Charts in replies', steps: [{ click: 'button:has-text("data-pulse")', wait: 1500 }] },
      { id: 'team', name: 'Team overview', steps: [{ click: '[aria-label="Team overview"]' }] },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
  },
  {
    slug: 'fall-zero',
    url: 'https://fall-zero.vercel.app/',
    about: 'View in Room tells you if it fits. Fall-Zero tells you if it falls: phone video of a room in, a tip-over verdict for every piece of furniture out.',
    why: 'Tip-overs send about 18,000 people in the US to the ER every year. Four in five of those killed are children.',
    stack: ['No framework', 'FastAPI', 'SAM 3.1'],
    wait: 2500,
    moments: [
      { id: 'home', name: 'Home' },
      { id: 'check', name: 'A room checked', steps: [{ click: '.sample[data-src*="nursery"]', wait: 1500 }, { click: '#send', wait: 80000 }], once: true },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
  },
  {
    slug: 'bot18',
    url: 'https://bot18-page.vercel.app/',
    repo: 'https://github.com/blueif16/arg_twin',
    title: 'Bot18',
    wait: 2500,
    moments: [
      { id: 'home', name: 'Home' },
      { id: 'read', name: 'Argon reads the footage', steps: [{ click: 'button[data-go="A"]', wait: 2500 }] },
      { id: 'libero', name: 'The LIBERO track', steps: [{ click: '[data-track="libero"]', wait: 1500 }] },
      { id: 'footage', name: 'Footage card', steps: [{ click: '[data-open="explain|input|0"]', wait: 2500 }] },
      { id: 'compile', name: 'Practice compiles into routines', steps: [{ click: 'button[data-go="E"]', wait: 2500 }] },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
  },
  {
    slug: 'pi-flow',
    url: 'https://piflow.sh/',
    repo: 'https://github.com/blueif16/PiFlow',
    title: 'Pi Flow',
    stack: ['Next.js', 'React'],
    moments: [
      { id: 'home', name: 'Home' },
      { id: 'section-1', name: 'The parts', scrollY: 900 },
      { id: 'node', name: 'A part', steps: [{ click: 'a[href="/product/node"]', wait: 2500 }] },
      { id: 'demo', name: 'Demo', scrollTo: '#start', wait: 5000 },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
    cover: 'section-1',
    wait: 5000,
    motion: true,
  },
  {
    slug: 'microduck',
    url: 'https://microduck-viz.vercel.app/',
    title: 'Microduck atlas',
    about: 'The Microduck robot in 3D, with every degree of freedom marked with what each training task does to it.',
    stack: ['Three.js'],
    motion: true,
    wait: 3500,
    moments: [
      { id: 'atlas', name: 'The atlas' },
      { id: 'loop', name: 'Training loop', steps: [{ click: '#tabs [data-tab="loop"]', wait: 2500 }] },
      { id: 'clip', name: 'Policy clip', steps: [{ hover: '.prof-btn', wait: 3000 }] },
    ],
  },
  {
    // The site before this one, kept at /v1 and shown as the last piece of work.
    slug: 'first-version',
    url: 'https://astro-blog-lemon.vercel.app/v1',
    repo: 'https://github.com/blueif16/astro-blog',
    title: 'This site, first version',
    about: 'What this site looked like before the gallery: one long scroll, led by a low-poly hedgehog.',
    stack: ['Astro', 'Three.js', 'GSAP'],
    year: 2026,
    liveHref: '/v1',
    hide: ['.archived-note', '.custom-cursor'],
    frozen: true,
    motion: true,
    wait: 2500,
    moments: [
      { id: 'intro', name: 'Opening', scrollTo: '#intro' },
      { id: 'stack', name: 'Stack', scrollTo: '#stack', wait: 3000 },
      { id: 'projects', name: 'Projects', steps: [{ scrollTo: '.pin-spacer', wait: 2500 }, { hover: '.project-card[data-project-id="cc-sts"]', wait: 2500 }] },
      { id: 'phone', name: 'On a phone', device: 'phone' },
    ],
  },
];
