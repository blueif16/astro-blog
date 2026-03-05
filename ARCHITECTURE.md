# Obsidian → Astro Blog Architecture

Complete documentation for the two-repo auto-deploy blog system.

---

## Architecture Overview

```
┌──────────────────────┐          ┌──────────────────────────────┐
│  REPO A (private)    │          │  REPO B (public)             │
│  Obsidian Vault      │  webhook │  Astro Blog Site             │
│  github.com/         │─────────▶│  github.com/                 │
│  blueif16/brain      │          │  blueif16/astro-blog         │
│                      │          │                              │
│  publish/            │          │  scripts/sync-content.sh     │
│  ├── blog/           │          │    ↓ clones Repo A at build  │
│  ├── notes/          │          │    ↓ copies publish/ folders │
│  ├── projects/       │          │  src/content/                │
│  ├── guides/         │          │  ├── blog/                   │
│  └── til/            │          │  ├── notes/                  │
│                      │          │  ├── projects/               │
│  .github/workflows/  │          │  ├── guides/                 │
│    trigger-deploy.yml│          │  └── til/                    │
│                      │          │                              │
│  Obsidian Git        │          │  Vercel auto-builds on       │
│  auto-commits        │          │  deploy hook POST            │
└──────────────────────┘          └──────────────────────────────┘
```

---

## Content Flow

1. **Write** in Obsidian (any device with vault synced)
2. **Save** - Obsidian Git auto-commits and pushes to `github.com/blueif16/brain`
3. **Trigger** - GitHub Action detects changes in `publish/` and fires Vercel Deploy Hook
4. **Build** - Vercel clones vault repo (sparse checkout), copies content, builds Astro site
5. **Deploy** - Site goes live in ~60 seconds

**Zero manual steps.** Write → save → live.

---

## Repository Structure

### Repo A: Obsidian Vault (`blueif16/brain`)

```
brain/
├── publish/                    # Blog-bound content (only this syncs)
│   ├── blog/                   # Essays, long-form
│   ├── notes/                  # Short-form, observations
│   ├── projects/               # Project writeups
│   ├── guides/                 # Tutorials, how-tos
│   └── til/                    # Today I learned
├── .github/workflows/
│   └── trigger-deploy.yml      # Fires Vercel deploy hook on publish/ changes
├── daily/                      # Private (not synced)
├── personal/                   # Private (not synced)
└── ...
```

**Frontmatter Convention:**

```yaml
---
title: "Post Title"
date: 2026-03-04
description: "Brief description for previews"
tags: [tag1, tag2]
draft: false
---

Your content with [[wikilinks]], callouts, math...
```

**GitHub Action** (`.github/workflows/trigger-deploy.yml`):

```yaml
name: Trigger Blog Deploy
on:
  push:
    branches:
      - main
    paths:
      - 'publish/**'

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deploy Hook
        run: curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}"
```

### Repo B: Astro Blog (`blueif16/astro-blog`)

```
astro-blog/
├── scripts/
│   └── sync-content.sh          # Pre-build: clones vault, copies content
├── src/
│   ├── content/                 # Populated at build time
│   │   └── .gitkeep
│   ├── content/config.ts        # Content collection schemas
│   ├── layouts/
│   │   ├── BaseLayout.astro     # HTML head, fonts, global styles
│   │   ├── PostLayout.astro     # Single post (ToC, reading time)
│   │   └── SectionLayout.astro  # Section index
│   ├── pages/
│   │   ├── index.astro          # Home: recent posts
│   │   ├── [...section]/
│   │   │   ├── index.astro      # Dynamic section listing
│   │   │   └── [...slug].astro  # Dynamic post page
│   │   ├── rss.xml.ts           # RSS feed
│   │   └── 404.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── ReadingTime.astro
│   │   └── TagList.astro
│   └── styles/
│       └── global.css           # Newsprint design system
├── astro.config.mjs
├── vercel.json                  # Build command config
└── package.json
```

**Content Sync Script** (`scripts/sync-content.sh`):

```bash
#!/bin/bash
set -euo pipefail

# Determine content directory BEFORE changing directories
if [ -n "${GITHUB_WORKSPACE:-}" ]; then
  CONTENT_DIR="$GITHUB_WORKSPACE/src/content"
else
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  CONTENT_DIR="$SCRIPT_DIR/../src/content"
fi

# Clone vault (sparse checkout — only publish/)
TEMP_DIR=$(mktemp -d)
git clone --depth 1 --filter=blob:none --sparse \
  "https://x-access-token:${VAULT_TOKEN}@github.com/${VAULT_REPO}.git" \
  "$TEMP_DIR"

cd "$TEMP_DIR"
git sparse-checkout set publish

# Copy content
rm -rf "$CONTENT_DIR"/*
for section in "$TEMP_DIR"/publish/*/; do
  if [ -d "$section" ]; then
    section_name=$(basename "$section")
    cp -r "$section" "$CONTENT_DIR/$section_name"
  fi
done

rm -rf "$TEMP_DIR"
```

**Vercel Config** (`vercel.json`):

```json
{
  "buildCommand": "bash scripts/sync-content.sh && npm run build",
  "outputDirectory": "dist"
}
```

**Environment Variables** (Vercel dashboard):
- `VAULT_TOKEN`: GitHub PAT with read access to `blueif16/brain`
- `VAULT_REPO`: `blueif16/brain`

---

## Design System: "Newsprint"

Editorial, serif-first, print-magazine aesthetic.

### Principles

- Serif body text (PT Serif, 1.15rem, line-height 1.72)
- Sans-serif headings for contrast
- 38rem content width (optimal reading)
- Warm paper background (#FDFBF7)
- Ink-dark text (#1A1A1A)
- Thin horizontal rules (newspaper style)
- Small caps for metadata
- No loud colors, no hero images, no gradients

### Color Palette

```css
:root {
  --bg:          #FDFBF7;  /* warm cream */
  --bg-subtle:   #F5F0E8;
  --text:        #1A1A1A;  /* ink dark */
  --text-muted:  #6B6560;
  --accent:      #A0522D;  /* burnt sienna */
  --border:      #D4CBC0;
  --code-bg:     #F0EBE3;
  --link:        #8B4513;  /* saddle brown */
}

[data-theme="dark"] {
  --bg:          #1C1B1A;
  --text:        #E8E4DD;
  --accent:      #D4956B;
  /* ... */
}
```

---

## Deployment Setup

### Initial Setup (Completed)

1. ✅ Vault repo pushed to `github.com/blueif16/brain`
2. ✅ Blog repo created at `github.com/blueif16/astro-blog`
3. ✅ Deployed to Vercel with environment variables
4. ✅ Deploy hook configured in vault repo secrets
5. ✅ Tested: auto-deploy working

### Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `VAULT_TOKEN` | Vercel | GitHub PAT (fine-grained, read-only on `brain` repo) |
| `VAULT_REPO` | Vercel | `blueif16/brain` |
| `VERCEL_DEPLOY_HOOK` | GitHub Secrets (vault repo) | Vercel deploy hook URL |

---

## Writing Workflow

### 1. Create a Post

In Obsidian, create a markdown file in any `publish/` subfolder:

```markdown
---
title: "Your Post Title"
date: 2026-03-04
description: "Brief description"
tags: [ai, coding]
draft: false
---

Your content here. Use Obsidian features freely:

- [[wikilinks]] to other posts
- > [!NOTE] Callouts render beautifully
- Math: $E = mc^2$ or $$\int_0^\infty e^{-x^2} dx$$
- Code blocks with syntax highlighting
```

### 2. Save

Obsidian Git plugin auto-commits and pushes (default: every 5 minutes or on manual save).

### 3. Wait ~60 Seconds

- GitHub Action fires deploy hook
- Vercel clones vault, syncs content, builds site
- Changes go live

### 4. Verify

Visit your live site to see the new post.

---

## Adding New Sections

Want a `/reads` section for book notes?

1. **Create folder:**
   ```bash
   mkdir ~/Desktop/brain/publish/reads
   ```

2. **Update content collections** (`src/content/config.ts`):
   ```typescript
   const reads = defineCollection({
     loader: glob({ pattern: '**/*.md', base: './src/content/reads' }),
     schema: contentSchema,
   });

   export const collections = { blog, notes, projects, guides, til, reads };
   ```

3. **Add to nav** (`src/components/Header.astro`):
   ```typescript
   const sections = [
     { name: 'blog', label: 'blog' },
     { name: 'notes', label: 'notes' },
     { name: 'projects', label: 'projects' },
     { name: 'reads', label: 'reads' },  // Add this
   ];
   ```

4. **Commit and push** the blog repo changes.

That's it. Dynamic routes handle the rest.

---

## Features

### Obsidian Compatibility

- ✅ Wikilinks (`[[other-post]]`)
- ✅ Callouts (`> [!NOTE]`, `> [!WARNING]`, etc.)
- ✅ Math equations (inline and block, via KaTeX)
- ✅ Code syntax highlighting (via rehype-pretty-code)
- ✅ Images (copy to `public/` and reference)

### Blog Features

- ✅ Reading time calculation
- ✅ Tag display and filtering
- ✅ RSS feed (`/rss.xml`)
- ✅ Responsive design
- ✅ Dark mode ready (CSS variables)
- ✅ SEO meta tags
- ✅ 404 page

---

## Local Development

### Vault (Obsidian)

Just write. Obsidian Git handles commits.

### Blog (Astro)

```bash
cd ~/Desktop/astro-blog

# Copy content manually for testing
cp -r ~/Desktop/brain/publish/* src/content/

# Or use the sync script (requires env vars)
export VAULT_TOKEN=your_token
export VAULT_REPO=blueif16/brain
bash scripts/sync-content.sh

# Start dev server
npm run dev  # http://localhost:4321
```

---

## Troubleshooting

### Deploy fails with "VAULT_TOKEN not set"

Check Vercel environment variables. Token must have read access to vault repo.

### GitHub Action doesn't fire

- Check `.github/workflows/trigger-deploy.yml` exists in vault repo
- Verify `VERCEL_DEPLOY_HOOK` secret is set: `gh secret list`
- Ensure changes are in `publish/` folder (action only triggers on that path)

### Content not syncing

- Check Vercel build logs for sync script errors
- Verify `VAULT_REPO` format: `username/repo-name` (no `github.com/`)
- Ensure vault repo has content in `publish/` folders

### Wikilinks not resolving

Wikilinks are converted to `/slug` format. Ensure target posts exist and use lowercase slugs with hyphens.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Writing | Obsidian |
| Version Control | Git + Obsidian Git plugin |
| Vault Hosting | GitHub (private repo) |
| Static Site Generator | Astro 5.x |
| Styling | Custom CSS (Newsprint design) |
| Markdown Processing | remark-obsidian-callout, remark-math, rehype-pretty-code, rehype-katex |
| Deployment | Vercel |
| CI/CD | GitHub Actions + Vercel Deploy Hooks |

---

## Key Design Decisions

**Why two repos?**
- Vault is your writing tool (private, personal notes included)
- Blog is deployment infrastructure (public, only `publish/` content)
- Clean separation of concerns

**Why sparse checkout?**
- Only `publish/` folder syncs to build server
- Your private notes never leave GitHub's encrypted storage
- Faster builds (less data to clone)

**Why folder-based sections?**
- Scales cleanly (add folder = add section)
- Maps 1:1 to URL structure and Astro collections
- No need to scan all files for frontmatter flags

**Why self-hosted fonts?**
- Zero external requests (faster, more private)
- No Google Fonts GDPR issues
- PT Serif woff2 files are ~25KB each

---

## Repositories

- **Vault:** https://github.com/blueif16/brain
- **Blog:** https://github.com/blueif16/astro-blog

---

## Maintenance

### Update Dependencies

```bash
cd ~/Desktop/astro-blog
npm update
git commit -am "chore: update dependencies"
git push
```

### Change Site Title/Name

Edit these files:
- `src/components/Header.astro` (site name)
- `src/components/Footer.astro` (footer text)
- `src/layouts/BaseLayout.astro` (page title format)
- `astro.config.mjs` (site URL)

### Add Custom Domain

1. Add domain in Vercel dashboard
2. Update `site` in `astro.config.mjs`
3. Commit and push

---

**Last Updated:** 2026-03-04
