// Puts the Boardwalk park at the front of this site (https://me.infinityopus.com/). Its built site is
// ~/boardwalk/dist, made by the crawl in that repo's tools/deploy.sh (run the crawl part there first when the park
// changes). Only the page itself, public/index.html (16 KB), ships with this site. Every other file the park loads
// (about 20 MB: the painting, the rides' sprites, its scripts) goes to the R2 bucket `promos` under park/<version>/,
// served from Cloudflare at https://promos.infinityopus.com/park/<version>/ with a year's cache. The page reads them
// from there through a <base href>. The bucket sends CORS headers (cors.json here), and the park's WebGL layers need
// them: every image they load sets crossOrigin, or WebGL refuses its pixels.
//
//   node scripts/boardwalk/sync.mjs          upload the park if it changed and write public/index.html
//   node scripts/boardwalk/sync.mjs --dry    say what would be uploaded; change nothing
//
// The version is a hash of every file, so a changed file means a new folder, and no cache anywhere can serve a stale
// copy. A sync keeps the folder the live site uses until the sync after it, so the site never points at a deleted
// folder between a sync and its deploy. scripts/boardwalk/r2.json records what is in the bucket.
//
// In use since 2026-11-10 (sync.sh runs this). The zone has a Cache Rule "broadwalk" (Hostname equals
// promos.infinityopus.com, eligible for cache): without it Cloudflare's edge doesn't cache .json, which isn't on its
// default list, and first visits were slower than from Vercel (JSON 114-120 ms a request against 52-70, 47-70 of them
// a visit). With it, measured with ~/boardwalk/tests/perf/tools/load_measure.mjs alternating Vercel and R2 (3 loads a
// cell), first visits were level with Vercel (JSON as fast or faster) and repeat visits much faster (phone 4G: painting
// 0.50 -> 0.19 s, sea 2.4 -> 0.8 s; 136 revalidations -> 0 requests, as the files are immutable for a year).
// (Check caching with GET: a HEAD request always shows cf-cache-status: DYNAMIC.)
import { createHash } from 'node:crypto';
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SRC = process.env.BOARDWALK_DIST ?? '/home/ran/boardwalk/dist';
const RECORD = join(HERE, 'r2.json');
const OWNED = join(HERE, 'owned.txt'); // what the last sync put in public/
const BUCKET = 'promos';
const PUBLIC = 'https://promos.infinityopus.com';
const SITE = 'https://me.infinityopus.com'; // the site's own files (its icon), which the <base> would send to R2
const BUDGET = 5 * 1024 ** 3; // shared with the films (scripts/films/films.mjs)
const AT_ONCE = 6;
const TYPES = {
  '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.css': 'text/css', '.glb': 'model/gltf-binary', '.txt': 'text/plain',
};

const dry = process.argv.includes('--dry');
const run = (argv) => execFileSync('wrangler', argv, { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] });
const runAsync = promisify(execFile);
const mb = (bytes) => `${(bytes / 1024 ** 2).toFixed(1)} MB`;

if (!existsSync(join(SRC, 'index.html'))) throw new Error(`no built park at ${SRC}`);

// Every file but the page, the Vercel link and dotfiles.
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.')) return [];
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const files = walk(SRC).filter((p) => relative(SRC, p) !== 'index.html').map((p) => relative(SRC, p).split('\\').join('/')).sort();
const unknown = files.filter((f) => !TYPES[extname(f)]);
if (unknown.length) throw new Error(`no content type for: ${unknown.join(', ')} (add it to TYPES)`);
const hash = createHash('sha256');
for (const f of files) hash.update(f).update('\0').update(readFileSync(join(SRC, f))).update('\0');
const version = hash.digest('hex').slice(0, 10);
const bytes = files.reduce((s, f) => s + statSync(join(SRC, f)).size, 0);
const base = `${PUBLIC}/park/${version}/`;
const record = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, 'utf8')) : { versions: [] };
console.log(`park ${version}: ${files.length} files, ${mb(bytes)}`);

// The page: a <base> to the version's folder (scripts, JSON, images and fonts resolve there), a preconnect so its
// connection opens while the HTML parses, and absolute URLs for what stays on this site (Explore and the icon).
function page() {
  let html = readFileSync(join(SRC, 'index.html'), 'utf8');
  const swap = (from, to, what) => {
    if (!html.includes(from)) throw new Error(`couldn't ${what}: check ${SRC}/index.html`);
    html = html.replace(from, to);
  };
  swap('<meta charset="utf-8">', `<meta charset="utf-8">\n<base href="${base}">\n<link rel="preconnect" href="${PUBLIC}" crossorigin>`, 'add the <base>');
  swap('params.get("explore") ?? "https://astro-blog-lemon.vercel.app"', 'params.get("explore") ?? new URL("/work", location.origin).href', 'point Explore at /work');
  // The park has no icon of its own; give it the site's (the Ran Studio seal).
  swap('<link rel="icon" href="data:,">', `<link rel="icon" href="${SITE}/favicon.svg" type="image/svg+xml"><link rel="icon" href="${SITE}/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="${SITE}/apple-touch-icon.png">`, "set the park's icon");
  if (/(?:href|src)="\/[^/]/.test(html)) throw new Error('index.html has a root-relative URL, which the <base> would send to R2');
  // WebKit (every iPhone browser) resolves a relative path in an inline script's import() against the page's URL, not the <base>:
  // on this site that 404s and the park never starts (2026-11-10). The page's load() resolves against document.baseURI.
  const relImport = html.match(/\bimport\(\s*[`'"]\.{0,2}\/[^)]*\)/);
  if (relImport) throw new Error(`index.html has ${relImport[0]}: iPhones resolve it against the page, not the <base>; use load()`);
  return html;
}
const html = page();

if (dry) {
  const have = record.versions.some((v) => v.version === version);
  console.log(have ? 'already in the bucket; would only write public/index.html' : `would upload ${files.length} files to ${base}`);
  process.exit(0);
}

// CORS: the park's modules, JSON and textures are cross-origin requests from the site.
let cors = '';
try { cors = run(['r2', 'bucket', 'cors', 'list', BUCKET]); } catch { /* none set yet: wrangler exits with an error */ }
if (!/GET/.test(cors)) run(['r2', 'bucket', 'cors', 'set', BUCKET, '--file', join(HERE, 'cors.json'), '--force']);

if (!record.versions.some((v) => v.version === version)) {
  const info = run(['r2', 'bucket', 'info', BUCKET]);
  const m = info.match(/bucket_size:\s*([\d.]+)\s*(B|KB|KiB|MB|MiB|GB|GiB|TB|TiB)/);
  const used = m ? +m[1] * { B: 1, KB: 1e3, KiB: 1024, MB: 1e6, MiB: 1024 ** 2, GB: 1e9, GiB: 1024 ** 3, TB: 1e12, TiB: 1024 ** 4 }[m[2]] : 0;
  if (used + bytes > BUDGET) throw new Error(`the bucket holds ${mb(used)}; ${mb(bytes)} more would pass the ${mb(BUDGET)} budget`);
  let next = 0, done = 0;
  const put = async (f) => {
    const argv = ['r2', 'object', 'put', `${BUCKET}/park/${version}/${f}`, '--file', join(SRC, f), '--content-type', TYPES[extname(f)],
      '--cache-control', 'public, max-age=31536000, immutable', '--remote'];
    for (let attempt = 1; ; attempt++) {
      try { await runAsync('wrangler', argv, { maxBuffer: 1 << 26 }); return; }
      catch (err) { if (attempt === 3) throw new Error(`upload of ${f} failed: ${err.stderr || err.message}`); }
    }
  };
  await Promise.all(Array.from({ length: AT_ONCE }, async () => {
    while (next < files.length) {
      const f = files[next++];
      await put(f);
      if (++done % 25 === 0 || done === files.length) console.log(`  uploaded ${done}/${files.length}`);
    }
  }));
  record.versions.push({ version, files, bytes, at: new Date().toISOString() });
  writeFileSync(RECORD, JSON.stringify(record, null, 2) + '\n');
}

// The folder must answer before the page points at it, with CORS.
const probe = await fetch(`${base}vendor/vendor.js`, { method: 'HEAD', headers: { Origin: SITE } });
if (!probe.ok || probe.headers.get('access-control-allow-origin') == null) {
  throw new Error(`${base}vendor/vendor.js answered ${probe.status} (CORS: ${probe.headers.get('access-control-allow-origin')})`);
}

// public/: what the last sync put there comes out, then the page goes in.
if (existsSync(OWNED)) for (const p of readFileSync(OWNED, 'utf8').split('\n').filter(Boolean)) rmSync(join(ROOT, 'public', p), { recursive: true, force: true });
writeFileSync(join(ROOT, 'public', 'index.html'), html);
writeFileSync(OWNED, 'index.html\n');

// Keep this version and the one before it (what the live site uses until this sync is deployed); delete older ones.
const keep = record.versions.filter((v) => v.version !== version).slice(-1).map((v) => v.version).concat(version);
for (const old of record.versions.filter((v) => !keep.includes(v.version))) {
  console.log(`deleting park/${old.version}/ (${old.files.length} files)`);
  let next = 0;
  await Promise.all(Array.from({ length: AT_ONCE }, async () => {
    while (next < old.files.length) {
      const f = old.files[next++];
      await runAsync('wrangler', ['r2', 'object', 'delete', `${BUCKET}/park/${old.version}/${f}`, '--remote']).catch(() => {});
    }
  }));
}
record.versions = record.versions.filter((v) => keep.includes(v.version));
writeFileSync(RECORD, JSON.stringify(record, null, 2) + '\n');
console.log(`public/index.html reads the park from ${base}`);
