# Blog Post Format

Push `.md` files to `publish/blog/` in your brain repo (`blueif16/brain`).
Each file becomes a blog entry within a minute or two of the push, with no deploy.

## Frontmatter

```yaml
---
title: "Your Post Title"
date: 2026-04-13
description: "A one-line summary for previews and SEO."
tags: [design, engineering]
draft: false
---
```

| Field         | Required | Default | Notes                              |
|---------------|----------|---------|------------------------------------|
| `title`       | yes      | —       | Post title                         |
| `date`        | yes      | —       | `YYYY-MM-DD` format               |
| `description` | no       | —       | Used in meta tags / previews       |
| `tags`        | no       | `[]`    | Array of lowercase tag strings     |
| `draft`       | no       | `false` | Set `true` to hide from listing    |

## Body

Standard markdown. These extras are supported:

- **Obsidian callouts**: `> [!NOTE]`, `> [!WARNING]`, etc.
- **Math**: inline `$E = mc^2$`, display `$$\sum_{i=1}^n$$`
- **Syntax highlighting**: fenced code blocks with language tag
- **Images**: `![alt](url)` — use absolute URLs or relative to repo

## File naming

Use kebab-case. The filename (minus `.md`) becomes the URL slug:

```
publish/blog/
  building-in-public.md    → /blog/building-in-public
  on-taste.md              → /blog/on-taste
```

## Going live

The site reads `publish/blog/` from `main` when a page is asked for, and Vercel keeps each page
until it is refreshed. Pushing to `publish/` on `main` runs the vault's
`.github/workflows/trigger-deploy.yml`, which refreshes `/blog` and every post page. To refresh by
hand, run that workflow from the vault's Actions tab.
