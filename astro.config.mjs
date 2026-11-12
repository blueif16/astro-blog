import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import { markdown } from './src/utils/markdown.mjs';

// The blog and feed pages are rendered on request from the vault and cached by Vercel with a cache
// tag per section, until /api/refresh, which the vault's GitHub webhook calls on every push, drops
// the tag, so a new post needs no deploy. Without the webhook's secret every push would be turned
// away and the cached pages would never refresh, so a Vercel build stops here.
if (process.env.VERCEL && !process.env.WEBHOOK_SECRET) {
  throw new Error('WEBHOOK_SECRET is not set; the blog and feed pages could never be refreshed.');
}

export default defineConfig({
  // Used for social preview images and links.
  site: 'https://me.infinityopus.com',
  output: 'static',
  adapter: vercel({
    imageService: true,
    isr: {
      // The webhook's endpoint answers each push itself; it mustn't be a cached page.
      exclude: ['/api/refresh'],
    },
  }),

  markdown,

  experimental: {
    liveContentCollections: true,
  },

  integrations: [react()],
});
