# astro-blog

me.infinityopus.com: Astro 5 on Vercel. The full write-up is ARCHITECTURE.md; this file is what to know before
changing content loading, caching or deploys.

## Summary
- Blog and feed content is read from the vault (blueif16/brain `main`) when a page renders. NEVER deploy to publish content.
- A vault push refreshes the site through a GitHub webhook and Vercel cache tags. NEVER add GitHub Actions for it.
- NEVER create `src/content/`, and keep the build free of vault reads.
- Before merging a change here, run the checks under "Verifying a change".

## How content refresh is set up (2026-11-12)
Why: a post must go live on a vault push with no build, and GitHub Actions can't start on this account (billing lock).
- `/blog`, `/blog/[slug]`, `/feed` and `/feed/[date]` render on demand (`export const prerender = false`) from live
  collections: `src/live.config.ts` → `src/utils/github-loader.ts` (`experimental.liveContentCollections`). Every other
  page is static.
- Vercel ISR caches them with no expiry (`isr` in `astro.config.mjs`). Each one calls `await addCacheTag('blog')` or
  `('feed')` before anything can return, so a cached 404 is tagged too.
- The vault's webhook (brain → Settings → Webhooks, id 710997793: push events, JSON) POSTs to `/api/refresh`
  (`src/pages/api/refresh.ts`, in `isr.exclude`). It checks `X-Hub-Signature-256` against `WEBHOOK_SECRET`, maps the
  changed paths to sections (`src/utils/refresh.ts`), and calls
  `dangerouslyDeleteByTag(sections, { revalidationDeadlineSeconds: 0 })`, so the next visit renders fresh.
- Vercel env (Production + Preview): `VAULT_TOKEN`, `VAULT_REPO`, `WEBHOOK_SECRET` (a Vercel build throws without it).
  `REVALIDATE_TOKEN` and the vault's `VERCEL_DEPLOY_HOOK` secret are left over and unused.
- Rejected, don't reintroduce: vault Actions calling a Deploy Hook (a full rebuild per push, and Actions can't run);
  an `x-prerender-revalidate` bypass-token crawl of every page (about 60 requests per push, fragile). Astro 7's
  `cacheVercel()` route caching would replace the tags here, but needs Astro 5→7 and @astrojs/vercel 9→11; revisit it
  when upgrading.

## Rules
- NEVER create `src/content/` or copy vault files there: Astro auto-generates a build-time `blog` collection from any
  folder in it, which clashes with the live one.
- NEVER move `@vercel/functions` below 3.x (pinned 3.10.5): `addCacheTag` and `dangerouslyDeleteByTag` only exist from v3.
- ALWAYS keep the webhook's content type JSON: Astro's origin check answers 403 to cross-site form POSTs.
- ALWAYS give a new on-demand content page `await addCacheTag('<section>')`, and add its vault folder to `sources` in
  `src/utils/refresh.ts`; otherwise pushes never refresh it.
- When a loader fetch fails, return the error (a 500), never an empty list: ISR would cache the empty page as whole.
- Pin `@astrojs/markdown-remark` to the exact version astro itself pins (`npm ls @astrojs/markdown-remark`), so pages
  rendered on request match the build.

## Verifying a change
- `npm test` (webhook signature and push parsing) and `npm run build`, then
  `jq -c '.routes[] | select(.src != null)' .vercel/output/config.json`: blog and feed go to `/_isr`, `/api/refresh`
  to `_render`.
- On a deployment (`vercel curl <path> --deployment <url>` for a protected preview): a page twice gives
  `x-vercel-cache: MISS` then `HIT`; after `vercel cache dangerously-delete --tag blog`, or a signed push to
  `/api/refresh`, the next request gives `REVALIDATED`.
- Webhook deliveries: `gh api repos/blueif16/brain/hooks/710997793/deliveries --jq '.[0:5][] | "\(.delivered_at) \(.event) \(.status_code)"'`
  (200 Refreshed …, 202 Nothing to refresh, 401 Bad signature).
- Deploys are a push to `main` (Vercel's git integration). A deploy clears the ISR cache, which is harmless.
