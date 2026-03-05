# Obsidian → Astro Blog

Complete two-repo architecture for auto-deploying an Obsidian vault to an Astro blog.

## Quick Links

- **Architecture Documentation:** [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete system documentation
- **Setup Guide:** [SETUP-COMPLETE.md](./SETUP-COMPLETE.md) - Initial setup steps
- **Live Site:** [Your Vercel URL]
- **Vault Repo:** https://github.com/blueif16/brain
- **Blog Repo:** https://github.com/blueif16/astro-blog

## How It Works

Write in Obsidian → Save → Auto-deploys to Vercel in ~60 seconds.

1. Write markdown in `publish/` folder of your Obsidian vault
2. Obsidian Git auto-commits and pushes
3. GitHub Action fires Vercel deploy hook
4. Vercel clones vault (sparse checkout), syncs content, builds site
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
- **CI/CD:** GitHub Actions + Deploy Hooks

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
