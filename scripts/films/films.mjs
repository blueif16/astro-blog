#!/usr/bin/env node
// Makes the web copies of the promo films in src/data/films.config.mjs and puts them in the R2
// bucket `promos`, served at https://promos.infinityopus.com. Runs on Ran's machine, where the
// masters are. Needs ffmpeg and a logged-in wrangler.
//
//   node scripts/films/films.mjs              encode and upload what's new or changed
//   node scripts/films/films.mjs --dry        encode only, report sizes, upload nothing
//   node scripts/films/films.mjs --only=vas   one project
//
// Each film becomes three files: the film at up to 1080p (H.264, bitrate capped, sound), a 6 s
// silent loop for the gallery, and a poster frame. The masters are never uploaded. Before every
// upload the bucket's real size is read, and nothing goes up that would take it past BUDGET:
// the free tier is 10 GB, and we keep to half of it. Replaced versions are deleted after the new
// one is up. src/data/films.manifest.json records what's in the bucket; the site reads it.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { films, mastersRoot } from '../../src/data/films.config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const WORK = join(HERE, '.work');
const MANIFEST = join(ROOT, 'src', 'data', 'films.manifest.json');
const BUCKET = 'promos';
const PUBLIC = 'https://promos.infinityopus.com';
const BUDGET = 5 * 1024 ** 3;
// Bump after changing the encoding settings below, to remake every copy.
const ENCODE_VERSION = 1;
const LOOP_SECONDS = 6;

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = args.find((a) => a.startsWith('--only='))?.split('=')[1];

const run = (cmd, argv, opts = {}) => execFileSync(cmd, argv, { encoding: 'utf8', maxBuffer: 1 << 26, ...opts });
const mb = (bytes) => `${(bytes / 1024 ** 2).toFixed(1)} MB`;

function probe(file) {
  const out = JSON.parse(
    run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file]),
  );
  return { width: out.streams[0].width, height: out.streams[0].height, duration: +(+out.format.duration).toFixed(2) };
}

// What the copies depend on: the master (size and time are enough, hashing 500 MB isn't needed),
// where the loop starts, and how we encode.
const masterOf = (film) => (film.master.startsWith('/') ? film.master : join(mastersRoot, film.master));

function versionOf(film) {
  const { size, mtimeMs } = statSync(masterOf(film));
  return createHash('sha256').update(JSON.stringify([size, Math.round(mtimeMs), film.loopAt, ENCODE_VERSION, ...(film.crop ? [film.crop] : [])])).digest('hex').slice(0, 8);
}

function encode(film, out) {
  const master = masterOf(film);
  const ff = (argv) => run('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...argv]);
  // `crop` (an ffmpeg crop, such as a screen recorder's border) comes off before anything else.
  const pre = film.crop ? `crop=${film.crop},` : '';
  // Fit inside 1920×1080 (or 1080×1920 for an upright film), even sides, never upscaled.
  const fit = `${pre}scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'`;
  ff([
    '-i', master, '-vf', fit, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '5M', '-bufsize', '10M',
    '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-movflags', '+faststart', out.full,
  ]);
  ff([
    '-ss', String(film.loopAt), '-t', String(LOOP_SECONDS), '-i', master, '-an', '-vf', `${pre}scale='min(1280,iw)':-2,fps=30`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out.loop,
  ]);
  ff(['-ss', String(film.loopAt), '-i', master, '-frames:v', '1', '-vf', `${pre}scale='min(1280,iw)':-2`, '-c:v', 'libwebp', '-quality', '82', out.poster]);
}

function bucketBytes() {
  const info = run('wrangler', ['r2', 'bucket', 'info', BUCKET], { stdio: ['ignore', 'pipe', 'ignore'] });
  const m = info.match(/bucket_size:\s*([\d.]+)\s*(B|KB|KiB|MB|MiB|GB|GiB|TB|TiB)/);
  if (!m) throw new Error('could not read the bucket size from wrangler');
  const unit = { B: 1, KB: 1e3, KiB: 1024, MB: 1e6, MiB: 1024 ** 2, GB: 1e9, GiB: 1024 ** 3, TB: 1e12, TiB: 1024 ** 4 }[m[2]];
  return +m[1] * unit;
}

const put = (key, file, type) =>
  run('wrangler', ['r2', 'object', 'put', `${BUCKET}/${key}`, '--file', file, '--content-type', type, '--cache-control', 'public, max-age=31536000, immutable', '--remote'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const remove = (key) => run('wrangler', ['r2', 'object', 'delete', `${BUCKET}/${key}`, '--remote'], { stdio: ['ignore', 'pipe', 'pipe'] });

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
mkdirSync(WORK, { recursive: true });
let failed = 0;

for (const [slug, list] of Object.entries(films)) {
  if (only && slug !== only) continue;
  const before = manifest[slug] ?? [];
  const after = [];
  for (const film of list) {
    const old = before.find((f) => f.id === film.id);
    const label = `${slug}/${film.id}`;
    try {
      const version = versionOf(film);
      const keep = { title: film.title, kind: film.kind };
      if (old?.version === version) {
        after.push({ ...old, ...keep });
        console.log(`${label}: up to date`);
        continue;
      }
      const base = `films/${slug}/${film.id}-${version}`;
      const out = { full: join(WORK, `${slug}-${film.id}-${version}.mp4`), loop: join(WORK, `${slug}-${film.id}-${version}-loop.mp4`), poster: join(WORK, `${slug}-${film.id}-${version}.webp`) };
      if (![out.full, out.loop, out.poster].every(existsSync)) encode(film, out);
      const bytes = statSync(out.full).size + statSync(out.loop).size + statSync(out.poster).size;
      const { width, height, duration } = probe(out.full);
      console.log(`${label}: film ${mb(statSync(out.full).size)}, loop ${mb(statSync(out.loop).size)}, poster ${mb(statSync(out.poster).size)} (${duration} s, ${width}×${height})`);
      if (dry) {
        if (old) after.push(old);
        continue;
      }
      // R2 reports its size with a delay, so count what the manifest says is up there too.
      const listed = Object.values(manifest).flat().reduce((sum, f) => sum + (f.bytes ?? 0), 0) - (old?.bytes ?? 0);
      const used = Math.max(bucketBytes(), listed);
      if (used + bytes > BUDGET) throw new Error(`would take the bucket to ${mb(used + bytes)}, past the ${mb(BUDGET)} budget`);
      put(`${base}.mp4`, out.full, 'video/mp4');
      put(`${base}-loop.mp4`, out.loop, 'video/mp4');
      put(`${base}.webp`, out.poster, 'image/webp');
      if (old) for (const key of old.keys ?? []) remove(key);
      after.push({
        id: film.id,
        ...keep,
        version,
        duration,
        width,
        height,
        bytes,
        src: `${PUBLIC}/${base}.mp4`,
        loop: `${PUBLIC}/${base}-loop.mp4`,
        poster: `${PUBLIC}/${base}.webp`,
        keys: [`${base}.mp4`, `${base}-loop.mp4`, `${base}.webp`],
      });
      console.log(`${label}: uploaded`);
    } catch (error) {
      failed += 1;
      console.error(`${label}: FAILED. ${String(error.message ?? error).split('\n')[0]}`);
      if (old) after.push(old);
    }
  }
  // Films taken out of the config come out of the bucket too.
  if (!dry) {
    for (const gone of before.filter((f) => !list.some((x) => x.id === f.id))) {
      for (const key of gone.keys ?? []) remove(key);
      console.log(`${slug}/${gone.id}: removed`);
    }
  }
  if (after.length) manifest[slug] = after;
  else delete manifest[slug];
}

if (!dry) {
  const ordered = Object.fromEntries(Object.keys(films).filter((s) => manifest[s]).map((s) => [s, manifest[s]]));
  writeFileSync(MANIFEST, `${JSON.stringify(ordered, null, 2)}\n`);
  const listed = Object.values(manifest).flat().reduce((sum, f) => sum + (f.bytes ?? 0), 0);
  console.log(`The films take ${mb(listed)} of the ${mb(BUDGET)} budget (R2 reports ${mb(bucketBytes())}; its count lags).`);
}
if (failed) process.exitCode = 1;
