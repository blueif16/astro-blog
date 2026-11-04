// Joins what you wrote (work.config.mjs) with what the capture run found (work.manifest.json).
// A project with no pictures yet is left out, so adding a URL can never break the site's build.
import { slugOf, work as config } from './work.config.mjs';
import manifest from './work.manifest.json';
import filmsManifest from './films.manifest.json';

export interface Moment {
  id: string;
  name: string;
  note?: string;
  device: 'desktop' | 'phone';
  ratio: number;
  widths: number[];
}

/** A promo film, as scripts/films/films.mjs put it in the bucket. */
export interface Film {
  id: string;
  title: string;
  kind: string;
  duration: number;
  width: number;
  height: number;
  /** The film at up to 1080p, with sound. */
  src: string;
  /** Six silent seconds for the gallery. */
  loop: string;
  poster: string;
}

export interface Work {
  slug: string;
  /** Missing for work with no website, such as a game. */
  url?: string;
  liveHref?: string;
  /** The code on GitHub, when it's public. */
  repo?: string;
  title: string;
  about: string;
  why: string;
  stack: string[];
  year: number;
  changedAt: string;
  frozen: boolean;
  /** A screen recording to play in place of the pictures on the detail page. */
  video?: string;
  /** Show the live site in a frame on the detail page, with the picture underneath until it loads. */
  live: boolean;
  cover: Moment;
  moments: Moment[];
  films: Film[];
}

export function allWork(): Work[] {
  const found: Work[] = [];
  for (const entry of config as any[]) {
    const slug = slugOf(entry);
    const taken = (manifest as Record<string, any>)[slug];
    if (!taken?.moments?.length) continue;
    const notes = new Map((entry.moments ?? []).map((m: any) => [m.id, m]));
    const moments: Moment[] = taken.moments.map((m: any) => {
      const set = notes.get(m.id) as any;
      return { ...m, name: set?.name ?? m.name, note: set?.note };
    });
    found.push({
      slug,
      url: entry.url,
      liveHref: entry.liveHref ?? entry.url,
      repo: entry.repo,
      title: entry.title ?? taken.title,
      about: entry.about ?? taken.description ?? '',
      why: entry.why ?? '',
      stack: entry.stack ?? [],
      year: entry.year ?? taken.year,
      changedAt: taken.changedAt,
      frozen: !!entry.frozen,
      video: entry.video,
      live: entry.live !== false && !entry.video && !!(entry.liveHref ?? entry.url),
      cover: moments.find((m) => m.id === entry.cover) ?? moments[0],
      moments,
      films: ((filmsManifest as Record<string, Film[]>)[slug] ?? []).map(({ id, title, kind, duration, width, height, src, loop, poster }) => ({
        id, title, kind, duration, width, height, src, loop, poster,
      })),
    });
  }
  return found;
}

/** 1:40 */
export const filmLength = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;

export const shotSrc = (slug: string, moment: Moment, width: number) => `/shots/${slug}/${moment.id}-${width}.webp`;

export const shotSrcset = (slug: string, moment: Moment) =>
  moment.widths.map((w) => `${shotSrc(slug, moment, w)} ${w}w`).join(', ');

export const largest = (moment: Moment) => Math.max(...moment.widths);

/** Each technology and the works that use it, most used first. Feeds the Stack view. */
export function stackIndex(works: Work[]) {
  const index = new Map<string, Work[]>();
  for (const work of works) {
    for (const tech of work.stack) index.set(tech, [...(index.get(tech) ?? []), work]);
  }
  return [...index.entries()]
    .map(([name, uses]) => ({ name, uses }))
    .sort((a, b) => b.uses.length - a.uses.length || a.name.localeCompare(b.name));
}
