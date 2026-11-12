# Obsidian → Astro Blog Architecture

Complete documentation for the two-repo blog system. New content goes live without a deploy.

---

## Architecture Overview

```
┌──────────────────────┐            ┌──────────────────────────────┐
│  REPO A (private)    │            │  REPO B (public)             │
│  Obsidian Vault      │  refresh   │  Astro Blog Site on Vercel   │
│  github.com/         │──────────▶ │  github.com/                 │
│  blueif16/brain      │  requests  │  blueif16/astro-blog         │
│                      │            │                              │
│  publish/blog/       │ ◀───────── │  /blog, /blog/<slug>         │
│  resources/briefings/│  GitHub API│  /feed, /feed/<date>         │
│                      │  on render │    rendered on request,      │
│  .github/workflows/  │            │    cached by Vercel (ISR)    │
│   trigger-deploy.yml │            │    until refreshed           │
│   trigger-rebuild.yml│            │                              │
│  .github/scripts/    │            │  every other page: static,   │
│   refresh-site.sh    │            │  built on deploy             │
└──────────────────────┘            └──────────────────────────────┘
```

---

## Content Flow

1. **Write** in Obsidian (any device with vault synced)
2. **Save** - Obsidian Git auto-commits and pushes to `github.com/blueif16/brain`
3. **Refresh** - A GitHub Action sees the change (`publish/**` or `resources/briefings/**` on `main`)
   and runs `.github/scripts/refresh-site.sh`, which requests each page of that section with the
   header `x-prerender-revalidate: $REVALIDATE_TOKEN`
4. **Render** - Vercel re-renders each requested page; the page reads the vault from the GitHub API
   (`src/live.config.ts`, `src/utils/github-loader.ts`) and is cached again
5. **Live** - Readers get the new page within a minute or two. Nothing is built or deployed.

**Zero manual steps.** Write → save → live. A push to this repo still deploys as before, and a
deploy clears the cache, so every page is rendered fresh on its first visit after it.

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
├── resources/briefings/        # Daily briefings, shown at /feed
├── .github/
│   ├── workflows/
│   │   ├── trigger-deploy.yml  # Refreshes the blog's pages on publish/ changes
│   │   └── trigger-rebuild.yml # Refreshes the feed's pages on resources/briefings/ changes
│   └── scripts/
│       └── refresh-site.sh     # Asks Vercel to re-render one section's pages
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

It runs `.github/scripts/refresh-site.sh blog <every post's path>`. The script requests the
section's index, then every page the index links to before and after that refresh (so added and
removed pages are both caught), and the extra paths it is given (drafts, which `/blog` doesn't
link to), each with the header `x-prerender-revalidate: $REVALIDATE_TOKEN`. A 200 or 404 is a
success; anything else fails the run. `trigger-rebuild.yml` does the same for `feed`. Both can
also be run by hand from the vault's Actions tab.

### Repo B: Astro Blog (`blueif16/astro-blog`)

```
astro-blog/
├── src/
│   ├── live.config.ts           # Live collections blog + feed, read from the vault on request
│   ├── utils/
│   │   ├── github-loader.ts     # Live loader: GitHub API → entries, markdown → HTML
│   │   └── markdown.mjs         # Markdown plugins, shared with astro.config.mjs
│   ├── layouts/
│   │   ├── BaseLayout.astro     # HTML head, fonts, global styles
│   │   ├── PostLayout.astro     # Single post (ToC, reading time)
│   │   └── SectionLayout.astro  # Section index
│   ├── pages/
│   │   ├── index.astro          # Home: recent posts
│   │   ├── blog/
│   │   │   ├── index.astro      # Post list (on request, cached)
│   │   │   └── [slug].astro     # Post page (on request, cached)
│   │   ├── feed/
│   │   │   ├── index.astro      # Briefing list (on request, cached)
│   │   │   └── [date].astro     # One day's briefing (on request, cached)
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

**Content loading.** The blog and feed are Astro live content collections
(`experimental.liveContentCollections` in Astro 5). Their pages set `export const prerender = false`,
and the Vercel adapter's `isr` option caches each one with no expiry until the next deploy or
refresh. `githubLoader` lists the vault's tree on `main` on every render and fetches only the files
it hasn't seen (blobs are cached by SHA). It renders markdown with Astro's own processor, using the
same plugins as the build (`src/utils/markdown.mjs`). If GitHub fails, the page returns a 500, so an
empty list is never cached. `src/content/` must stay absent: Astro would turn any folder there into
a build-time collection, and a `blog` one would clash with the live `blog` collection.

**Vercel Config** (`vercel.json`): plain `npm run build`. The build doesn't read the vault.

**Environment Variables** (Vercel dashboard, read when a page renders):
- `VAULT_TOKEN`: GitHub PAT with read access to `blueif16/brain`
- `VAULT_REPO`: `blueif16/brain`
- `REVALIDATE_TOKEN`: the ISR bypass token, read at build. A Vercel build fails without it.

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
4. ✅ Refresh token set in Vercel and in the vault repo's secrets
5. ✅ Tested: pages refresh without a deploy

### Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `VAULT_TOKEN` | Vercel | GitHub PAT (fine-grained, read-only on `brain` repo) |
| `VAULT_REPO` | Vercel | `blueif16/brain` |
| `REVALIDATE_TOKEN` | Vercel (Production, Preview) and GitHub Secrets (vault repo) | The same random string in both (`openssl rand -hex 32`) |

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

### 3. Wait a Minute or Two

- GitHub Action refreshes the section's pages
- Vercel re-renders each one from the vault
- Changes go live, with no build or deploy

### 4. Verify

Visit your live site to see the new post.

---

## Adding New Sections

Want a `/reads` section for book notes?

1. **Create folder:**
   ```bash
   mkdir ~/Desktop/brain/publish/reads
   ```

2. **Add a live collection** (`src/live.config.ts`), and pages for it under `src/pages/reads/`
   with `export const prerender = false`, like `src/pages/blog/`:
   ```typescript
   const reads = defineLiveCollection({
     loader: githubLoader({ repo, path: 'publish/reads', pattern: /\.md$/, token, branch: 'main' }),
     schema: contentSchema,
   });

   export const collections = { blog, feed, reads };
   ```
   Then add a vault workflow that runs `.github/scripts/refresh-site.sh reads` on changes there.

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

# Pages read the vault's main branch on each request; put VAULT_TOKEN and VAULT_REPO in .env
# (see .env.example). Don't copy content into src/content/ (see "Content loading").
npm run dev  # http://localhost:4321
```

---

## Troubleshooting

### Blog or feed pages return 500

The page couldn't read the vault. Check the function logs in Vercel for `Failed to load …`, and
check that `VAULT_TOKEN` (read access to the vault repo) and `VAULT_REPO` are set.

### Deploy fails with "REVALIDATE_TOKEN is not set"

Add `REVALIDATE_TOKEN` to the Vercel project's environment variables, with the same value as the
vault repo's secret.

### A change doesn't show up

- Check the run of `trigger-deploy.yml` (blog) or `trigger-rebuild.yml` (feed) in the vault's
  Actions tab. Each line it logs is a status and a path, and any status but 200 or 404 fails the run.
- Verify the vault's `REVALIDATE_TOKEN` secret matches Vercel's: `gh secret list -R blueif16/brain`.
  With the wrong token, a refresh request is just served the cached page.
- Ensure the change is on `main` in `publish/blog/` or `resources/briefings/`
- Run the workflow by hand from the Actions tab to refresh again

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
| CI/CD | GitHub Actions + Vercel on-demand ISR |

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
