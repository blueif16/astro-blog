# Blog Post Format

Push `.md` files to `publish/blog/` in your brain repo (`blueif16/brain`).
Each file becomes a blog entry seconds after the push, with no deploy.

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
until a push changes `publish/blog/`. The vault's GitHub webhook tells the site about each push,
and the site then drops every blog page from the cache, so the next visit renders it fresh. To do
the same by hand: `vercel cache dangerously-delete --tag blog`.
