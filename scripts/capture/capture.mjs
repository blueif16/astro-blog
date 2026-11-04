#!/usr/bin/env node
// Takes the pictures for the frontend gallery from each live site in src/data/work.config.mjs.
//
//   node scripts/capture/capture.mjs            retake what changed since the last run
//   node scripts/capture/capture.mjs --check    only report what changed (needs no packages)
//   node scripts/capture/capture.mjs --force    retake everything
//   node scripts/capture/capture.mjs --only=appify --from=http://localhost:4321/
//
// A project is retaken when Vercel has a new production deployment for its URL, or when its entry
// in the config changed. Sites not on Vercel fall back to the page's ETag or a hash of its HTML.
// A failed or blank picture never replaces a good one: the old one stays and the run exits 1.
// A new picture that looks the same as the old one is dropped, so a deploy that changes nothing
// you can see makes no commit and no rebuild.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugOf, vercelTeamId, work } from '../../src/data/work.config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT = join(ROOT, 'public', 'shots');
const MANIFEST = join(ROOT, 'src', 'data', 'work.manifest.json');
const SEEN = join(HERE, '.seen.json');

// Bump to retake everything after changing how pictures are made.
const PIPELINE_VERSION = 1;
const RETRY_FAILED_AFTER_MS = 24 * 60 * 60 * 1000;
const PROJECTS_AT_ONCE = 3;
const DEFAULT_SECTIONS = 3;

const DEVICES = {
  desktop: {
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
    widths: [2400, 1200, 600],
  },
  phone: {
    context: {
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    },
    widths: [786, 393],
  },
};

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

const readJson = (path, fallback) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback);
const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

// `still`: a picture kept in the repo (path from the repo root) instead of one taken from the live
// site, for views a script can't reach, such as a camera placed inside a 3D world.
const stillPath = (moment) => join(ROOT, moment.still);

const configHash = (entry) => {
  const { url, moments, sections, hide, wait, ready, motion, at, scale } = entry;
  // Words shown beside a picture don't change the picture, so editing a note retakes nothing.
  // A still counts by its contents, so replacing the file at the same path remakes its pictures.
  const shots = moments?.map(({ note, ...shot }) =>
    shot.still && existsSync(stillPath(shot)) ? { ...shot, file: sha(readFileSync(stillPath(shot))) } : shot,
  );
  return sha(JSON.stringify({ PIPELINE_VERSION, url, moments: shots, sections, hide, wait, ready, motion, at, scale }));
};

// ── What changed ────────────────────────────────────────────────────────────────────────────

async function vercelProjects() {
  const query = `/v9/projects?limit=100&teamId=${vercelTeamId}`;
  const token = process.env.VERCEL_TOKEN;
  const projects = [];
  try {
    if (token) {
      let until = '';
      do {
        const res = await fetch(`https://api.vercel.com${query}${until && `&until=${until}`}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Vercel API answered ${res.status}`);
        const page = await res.json();
        projects.push(...page.projects);
        until = page.pagination?.next ?? '';
      } while (until);
    } else {
      // Local runs: use the logged-in Vercel CLI when there is one.
      const out = execFileSync('vercel', ['api', query], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
      projects.push(...JSON.parse(out).projects);
    }
  } catch (error) {
    if (token) console.warn(`Could not read Vercel projects: ${error.message}. Falling back to page fingerprints.`);
    return new Map();
  }

  const byHost = new Map();
  for (const project of projects) {
    const live = project.targets?.production;
    if (!live?.id) continue;
    for (const host of live.alias ?? []) {
      byHost.set(host, { deployment: live.id, deployedAt: live.createdAt, createdAt: project.createdAt, name: project.name });
    }
  }
  return byHost;
}

async function fingerprint(entry, byHost) {
  if (!entry.url) return null; // Pictures only, no site: the config hash covers every change.
  try {
    const res = await fetch(entry.url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    // A domain can still be listed on a Vercel project after the site moved elsewhere, so trust
    // the deployment id only when Vercel is what actually answered.
    const hit = byHost.get(new URL(entry.url).hostname);
    if (hit && res.headers.get('server')?.toLowerCase() === 'vercel') return `vercel:${hit.deployment}`;
    const etag = res.headers.get('etag');
    return etag ? `etag:${etag}` : `html:${sha(await res.text())}`;
  } catch {
    return null; // Down right now: leave the pictures alone and look again next run.
  }
}

function whyStale(entry, fp, manifest, seen) {
  const slug = slugOf(entry);
  const last = seen[slug];
  if (flag('force')) return 'forced';
  if (!manifest[slug]) return 'new';
  if (entry.frozen) return null;
  if (last?.config !== configHash(entry)) return 'config changed';
  if (last?.failedAt && Date.now() - last.failedAt > RETRY_FAILED_AFTER_MS) return 'retrying a failure';
  if (fp && last?.fingerprint !== fp) return 'new deployment';
  return null;
}

// ── Taking one picture ──────────────────────────────────────────────────────────────────────

async function settle(page, entry, ms) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  // Wait for images on screen, so placeholders are not what gets photographed.
  await page
    .evaluate(() => {
      const inView = [...document.images].filter((img) => {
        const box = img.getBoundingClientRect();
        return box.bottom > 0 && box.top < innerHeight && !img.complete;
      });
      return Promise.race([
        Promise.all(inView.map((img) => img.decode().catch(() => {}))),
        new Promise((done) => setTimeout(done, 8000)),
      ]);
    })
    .catch(() => {});
  await page.waitForTimeout(ms ?? entry.wait ?? 1500);
}

async function openPage(browser, entry, url, device) {
  const context = await browser.newContext({
    ...DEVICES[device].context,
    ...(entry.scale ? { deviceScaleFactor: entry.scale } : {}),
    reducedMotion: entry.motion ? 'no-preference' : 'reduce',
    timezoneId: 'America/Los_Angeles',
    locale: 'en-US',
    colorScheme: 'light',
  });
  const page = await context.newPage();
  if (entry.at) await page.clock.setFixedTime(new Date(entry.at));

  const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  if (!response || response.status() >= 400) throw new Error(`${url} answered ${response?.status() ?? 'nothing'}`);
  const landed = new URL(page.url()).hostname;
  if (landed !== new URL(url).hostname) throw new Error(`${url} redirected to ${landed}`);

  if (entry.hide?.length) await page.addStyleTag({ content: `${entry.hide.join(',')}{display:none!important}` });
  if (entry.ready) await page.waitForSelector(entry.ready, { state: 'attached', timeout: 30000 });
  await settle(page, entry);
  return { context, page };
}

async function runSteps(page, entry, moment) {
  for (const step of moment.steps ?? []) {
    if (step.click) await page.locator(step.click).first().click({ timeout: 10000 });
    if (step.hover) await page.locator(step.hover).first().hover({ timeout: 10000 });
    if (step.press) await page.keyboard.press(step.press);
    if (step.scrollTo) await page.locator(step.scrollTo).first().scrollIntoViewIfNeeded({ timeout: 10000 });
    await settle(page, entry, step.wait ?? 900);
  }
  if (moment.scrollTo) {
    const found = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      return true;
    }, moment.scrollTo);
    if (!found) throw new Error(`nothing matches ${moment.scrollTo}`);
    await settle(page, entry, moment.wait ?? 1500);
  }
  if (moment.scrollY != null) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), moment.scrollY);
    await settle(page, entry, moment.wait ?? 1500);
  }
}

async function photograph(browser, entry, url, moment) {
  const device = moment.device ?? 'desktop';
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let context;
    try {
      const opened = await openPage(browser, entry, url, device);
      context = opened.context;
      await runSteps(opened.page, entry, moment);
      return await opened.page.screenshot({ type: 'png', animations: entry.motion ? 'allow' : 'disabled' });
    } catch (error) {
      lastError = error;
    } finally {
      await context?.close();
    }
  }
  throw lastError;
}

// When a project lists no moments: its home screen, its first few sections, and a phone.
async function defaultMoments(browser, entry, url) {
  const { context, page } = await openPage(browser, entry, url, 'desktop');
  const sections = await page.evaluate((limit) => {
    const found = [];
    for (const section of document.querySelectorAll('section')) {
      if (section.parentElement.closest('section, dialog')) continue;
      const box = section.getBoundingClientRect();
      const style = getComputedStyle(section);
      if (box.height < 320 || box.width < innerWidth * 0.5 || style.display === 'none' || style.visibility === 'hidden') continue;
      if (box.top + scrollY < innerHeight * 0.8) continue;
      const heading = section.querySelector('h1, h2, h3')?.textContent.trim().replace(/\s+/g, ' ');
      found.push({ y: Math.round(box.top + scrollY), name: heading?.slice(0, 48) || '' });
      if (found.length === limit) break;
    }
    return found;
  }, entry.sections ?? DEFAULT_SECTIONS);
  await context.close();
  return [
    { id: 'home', name: 'Home' },
    ...sections.map((s, i) => ({ id: `section-${i + 1}`, name: s.name || `Section ${i + 1}`, scrollY: s.y })),
    { id: 'phone', name: 'On a phone', device: 'phone' },
  ];
}

// ── Judging a picture ───────────────────────────────────────────────────────────────────────

async function loadSharp() {
  return (await import('sharp')).default;
}

async function looksBlank(sharp, png) {
  const { channels } = await sharp(png).resize(160).stats();
  return channels.slice(0, 3).every((channel) => channel.stdev < 1.5);
}

// Share of pixels that visibly differ between two images. Small enough to ignore compression
// noise, sensitive enough to catch one edited word (about 0.05% of the frame).
async function differenceBetween(sharp, a, b) {
  const shrink = (input) => sharp(input).resize(320, 200, { fit: 'fill' }).greyscale().raw().toBuffer();
  const [pa, pb] = await Promise.all([shrink(a), shrink(b)]);
  let changed = 0;
  for (let i = 0; i < pa.length; i += 1) if (Math.abs(pa[i] - pb[i]) > 12) changed += 1;
  return changed / pa.length;
}
const SAME_PICTURE_BELOW = 0.0005;

// ── One project ─────────────────────────────────────────────────────────────────────────────

const cleanTitle = (title) => title.split(/\s+[·|—–-]\s+/)[0].trim();

async function captureProject(browser, sharp, entry, previous, vercel) {
  const slug = slugOf(entry);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`bad slug: ${slug}`);
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });

  const url = option('from') ?? entry.url;
  const moments = entry.moments ?? (await defaultMoments(browser, entry, url));
  const failures = [];
  const results = [];
  let visualChange = false;

  for (const moment of moments) {
    const device = moment.device ?? 'desktop';
    const { widths } = DEVICES[device];
    const smallest = join(dir, `${moment.id}-${widths.at(-1)}.webp`);
    const before = previous?.moments?.find((m) => m.id === moment.id);
    // `once`: taken the first time, then kept. For screens that cost something to reach.
    if (moment.once && before && existsSync(smallest)) {
      results.push(before);
      console.log(`  ${slug}/${moment.id}: taken once, kept`);
      continue;
    }
    try {
      const png = moment.still ? readFileSync(stillPath(moment)) : await photograph(browser, entry, url, moment);
      if (await looksBlank(sharp, png)) throw new Error('the picture came out blank');
      const { width, height } = await sharp(png).metadata();
      const saved = widths.filter((w) => w <= width);
      const small = await sharp(png).resize(widths.at(-1)).webp({ quality: 82, effort: 5 }).toBuffer();
      const unchanged = before && existsSync(smallest) && (await differenceBetween(sharp, small, smallest)) < SAME_PICTURE_BELOW;
      if (!unchanged) {
        visualChange = true;
        for (const w of saved) {
          await sharp(png).resize(w).webp({ quality: 82, effort: 5 }).toFile(join(dir, `${moment.id}-${w}.webp`));
        }
      }
      results.push({
        id: moment.id,
        name: moment.name,
        device,
        ratio: +(width / height).toFixed(4),
        widths: saved,
        ...(moment.id === moments[0].id ? { png } : {}),
      });
      console.log(`  ${slug}/${moment.id}: ${unchanged ? 'looks the same, kept' : 'new picture'}`);
    } catch (error) {
      const reason = String(error.message ?? error).split('\n')[0];
      failures.push(`${slug}/${moment.id}: ${reason}`);
      console.error(`  ${slug}/${moment.id}: FAILED, keeping the old picture. ${reason}`);
      if (before) results.push(before);
    }
  }

  // Remove pictures of moments no longer in the config.
  const keep = new Set(results.flatMap((m) => m.widths.map((w) => `${m.id}-${w}.webp`)));
  for (const file of readdirSync(dir)) if (!keep.has(file)) rmSync(join(dir, file));

  if (!results.length) return { failures, record: previous ?? null };

  const page = url ? await readPageInfo(browser, entry, url).catch(() => null) : null;
  const now = new Date().toISOString();
  const record = {
    url: entry.url,
    title: page?.title || previous?.title || slug,
    description: page?.description || previous?.description || '',
    year: new Date(vercel?.createdAt ?? previous?.firstCapturedAt ?? now).getFullYear(),
    firstCapturedAt: previous?.firstCapturedAt ?? now,
    changedAt: visualChange || !previous ? now : previous.changedAt,
    moments: results.map(({ png, ...moment }) => moment),
  };
  return { failures, record };
}

async function readPageInfo(browser, entry, url) {
  const { context, page } = await openPage(browser, entry, url, 'desktop');
  const info = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content ?? '',
  }));
  await context.close();
  return { title: cleanTitle(info.title), description: info.description };
}

// ── Main ────────────────────────────────────────────────────────────────────────────────────

const manifest = readJson(MANIFEST, {});
const seen = readJson(SEEN, {});
const only = option('only');
const byHost = await vercelProjects();
console.log(byHost.size ? `Vercel: read ${byHost.size} production addresses.` : 'Vercel: not connected, using page fingerprints.');

const plan = [];
for (const entry of work) {
  if (only && slugOf(entry) !== only) continue;
  const fp = await fingerprint(entry, byHost);
  const reason = option('from') ? 'local source' : whyStale(entry, fp, manifest, seen);
  console.log(`${slugOf(entry).padEnd(24)} ${reason ?? 'up to date'}`);
  if (reason) plan.push({ entry, fp });
}

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `stale=${plan.length > 0}\n`);

if (flag('check')) process.exit(0);

// Projects taken out of the config lose their pictures.
if (!only) {
  const wanted = new Set(work.map(slugOf));
  for (const slug of Object.keys(manifest)) {
    if (wanted.has(slug)) continue;
    delete manifest[slug];
    delete seen[slug];
    rmSync(join(OUT, slug), { recursive: true, force: true });
    console.log(`${slug}: removed`);
  }
}

const allFailures = [];
if (plan.length) {
  const sharp = await loadSharp();
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  const queue = [...plan];
  await Promise.all(
    Array.from({ length: Math.min(PROJECTS_AT_ONCE, queue.length) }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const slug = slugOf(job.entry);
        const vercel = job.entry.url ? byHost.get(new URL(job.entry.url).hostname) : undefined;
        try {
          const { failures, record } = await captureProject(browser, sharp, job.entry, manifest[slug], vercel);
          allFailures.push(...failures);
          if (record) manifest[slug] = record;
          seen[slug] = { fingerprint: job.fp, config: configHash(job.entry), ...(failures.length ? { failedAt: Date.now() } : {}) };
        } catch (error) {
          allFailures.push(`${slug}: ${String(error.message ?? error).split('\n')[0]}`);
          seen[slug] = { fingerprint: job.fp, config: configHash(job.entry), failedAt: Date.now() };
        }
      }
    }),
  );
  await browser.close();
}

const ordered = Object.fromEntries(work.map(slugOf).filter((slug) => manifest[slug]).map((slug) => [slug, manifest[slug]]));
writeFileSync(MANIFEST, `${JSON.stringify(ordered, null, 2)}\n`);
writeFileSync(SEEN, `${JSON.stringify(seen, null, 2)}\n`);

if (allFailures.length) {
  console.error(`\n${allFailures.length} picture(s) failed. The site keeps the previous pictures for these:`);
  for (const failure of allFailures) console.error(`  ${failure}`);
  console.error('If a selector in the config no longer matches, update that moment in src/data/work.config.mjs.');
  process.exitCode = 1;
}
