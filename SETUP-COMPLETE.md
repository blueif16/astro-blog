# Obsidian → Astro Blog Setup Complete

## ✅ What's Done

### Vault Structure (~/Desktop/brain)
- Created `publish/` folder with 5 sections: blog, notes, projects, guides, til
- Added sample blog post with Obsidian features (wikilinks, callouts, math)
- Created GitHub Action (`.github/workflows/trigger-deploy.yml`) to trigger deploys on `publish/` changes
- Added `README-BLOG.md` with full documentation

### Blog Site (~/Desktop/astro-blog)
- Scaffolded Astro project with all dependencies installed
- Implemented Newsprint design system (PT Serif, warm cream background, editorial layout)
- Created all layouts: BaseLayout, PostLayout, SectionLayout
- Created all components: Header, Footer, PostCard, ReadingTime, TagList
- Built dynamic routing for all sections (`/blog`, `/notes`, `/projects`, etc.)
- Set up content collections with shared schema
- Added RSS feed at `/rss.xml`
- Created 404 page
- Configured Vercel deployment with `sync-content.sh` script
- Git initialized with initial commit

## 🚀 Next Steps

### 1. Deploy Blog to Vercel

```bash
cd ~/Desktop/astro-blog
# Push to GitHub first
gh repo create astro-blog --public --source=. --remote=origin --push
```

Then in Vercel dashboard:
1. Import the `astro-blog` repo
2. Add environment variables:
   - `VAULT_TOKEN`: Create a GitHub PAT with read access to your vault repo
   - `VAULT_REPO`: `blueif16/<your-vault-repo-name>`
3. Deploy

### 2. Set Up Auto-Deploy

1. Copy the Vercel Deploy Hook URL from your project settings
2. Add it to your vault repo's secrets as `VERCEL_DEPLOY_HOOK`:
   ```bash
   cd ~/Desktop/brain
   gh secret set VERCEL_DEPLOY_HOOK
   # Paste the hook URL when prompted
   ```

### 3. Test the Flow

1. Edit a file in `~/Desktop/brain/publish/blog/`
2. Obsidian Git will auto-commit and push
3. GitHub Action fires the deploy hook
4. Vercel rebuilds the blog (~60 seconds)
5. Your post is live

## 📝 Writing Posts

Create markdown files in any `publish/` subfolder with this frontmatter:

```yaml
---
title: "Your Post Title"
date: 2026-03-04
description: "Brief description for previews"
tags: [ai, coding, tools]
draft: false
---

Your content here. Use **Obsidian** features freely:
- [[wikilinks]]
- > [!NOTE] Callouts
- Math: $E = mc^2$
```

## 🎨 Design Features

- Serif body text (PT Serif) at 1.15rem
- Sans-serif headings for contrast
- 38rem content width (optimal reading)
- Warm cream background (#FDFBF7)
- Thin horizontal rules (newspaper style)
- Small caps for metadata
- Reading time calculation
- Tag display

## 🔧 Local Development

```bash
cd ~/Desktop/astro-blog
npm run dev  # http://localhost:4321
```

The dev server is starting in the background. Check it at http://localhost:4321 once it's ready.

## 📂 Adding New Sections

1. `mkdir ~/Desktop/brain/publish/reads`
2. Edit `astro-blog/src/content/config.ts` to add the collection
3. Add to nav in `src/components/Header.astro`

Everything else is automatic.
