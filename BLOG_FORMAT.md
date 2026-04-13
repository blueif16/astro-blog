# Blog Post Format

Push `.md` files to `publish/blog/` in your brain repo (`blueif16/brain`).
The site rebuilds automatically and each file becomes a blog entry.

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

## Rebuild

Pushing to `publish/blog/` on `main` triggers a Vercel deploy via GitHub Action.
