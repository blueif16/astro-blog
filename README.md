# Obsidian → Astro Blog

Complete two-repo architecture for auto-deploying an Obsidian vault to an Astro blog.

## Quick Links

- **Architecture Documentation:** [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete system documentation
- **Setup Guide:** [SETUP-COMPLETE.md](./SETUP-COMPLETE.md) - Initial setup steps
- **Live Site:** [Your Vercel URL]
- **Vault Repo:** https://github.com/blueif16/brain
- **Blog Repo:** https://github.com/blueif16/astro-blog

## How It Works

Write in Obsidian → Save → live in a minute or two, with no deploy.

1. Write markdown in `publish/blog/` of your Obsidian vault
2. Obsidian Git auto-commits and pushes
3. GitHub Action asks Vercel to refresh the blog's pages
4. Vercel re-renders each page from the vault (GitHub API) and caches it again
5. Changes go live

## Writing Posts

Create markdown files in `publish/blog/`, `publish/notes/`, etc.:

```yaml
---
title: "Post Title"
date: 2026-03-04
description: "Brief description"
tags: [tag1, tag2]
---

Your content with [[wikilinks]], callouts, math...
```

## Design

Newsprint-inspired aesthetic:
- PT Serif body text
- 38rem content width
- Warm cream background
- Editorial, minimal layout

## Tech Stack

- **Writing:** Obsidian
- **Static Site Generator:** Astro 5.x
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions + Vercel on-demand ISR

## Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Complete system architecture
- Repository structure
- Content flow diagrams
- Design system details
- Deployment setup
- Troubleshooting guide
- Maintenance instructions

## Local Development

```bash
npm run dev  # http://localhost:4321
```

## Status

✅ Deployed and working
✅ Auto-deploy pipeline active
✅ All Obsidian features supported (wikilinks, callouts, math)

## Frontend gallery

The site at https://me.infinityopus.com opens on the Boardwalk park (`/`, copied in by `scripts/boardwalk/sync.sh`); its Explore button leads to the gallery at `/work`, which shows the work in `src/data/work.config.mjs`. **The full format for adding a product (pictures, notes, promo films) is in [docs/ADDING-WORK.md](docs/ADDING-WORK.md).** The shortest version: add a line and push:

```js
{ url: 'https://my-site.vercel.app/' },
```

A GitHub Action (`.github/workflows/capture-work.yml`) photographs it and reads its title and description. Every hour it checks Vercel for new production deployments and retakes those pictures; if they look different, it commits them and the site rebuilds. A failed or blank picture never replaces a good one: the old one stays and the run goes red.

- **Setup:** add a `VERCEL_TOKEN` secret to this repo. Without it, sites are compared by ETag or HTML hash, which can miss a deploy that only changes unhashed files.
- **Choose what's shown:** by default a project gets its home screen, up to three sections found on the page, and a phone. The options at the top of the config set named moments, reach things behind clicks, and add notes and reasons.
- **Retake everything:** `gh workflow run capture-work.yml -f force=true`
- **Run it locally:** `npm ci --prefix scripts/capture && npx --prefix scripts/capture playwright install chromium && node scripts/capture/capture.mjs`

The gallery has two views of the same work: **Scroll**, one picture at a time with the names down the left and the words on the right, and **Grid**, every picture on one screen with a small name under each. Each project page is full screen and set like a report spread: a thin top bar with a button back to the gallery, then the live site itself, running in a frame at desktop or phone size and scaled down so it keeps its shape (its picture shows until it loads), then the title and a few short columns. Set `live: false` on a project to show its pictures there instead, or `video` to play a recording. The gallery itself always uses the pictures: twelve live sites on one page would be far too heavy. The design references are in `docs/design-references/`.

Under the first screen, a project page has design notes, read from `src/data/design/<slug>.json` (see `appify.json`). Its optional sections are **Features** and **Places** (rows of words beside a picture), **Interface** (how the screen works, with a second picture), **Palette** (drawn as a Fibonacci tiling, largest colour first) and **Type** (each face shown in itself, loaded from Google Fonts when it's there). Above them, a project's promo films (`src/data/films.config.mjs`, served from the R2 bucket `promos`) play in a **Films** section; the gallery shows the first one or two beside the project. The sections sit on three columns cut at the golden ratio, 38.2 / 23.6 / 38.2, with the two cuts drawn down the page. A project with no file just has no notes, and `repo` in the config adds its GitHub link.

The previous version of the site is kept at `/v1` and appears as the last piece in the gallery.
