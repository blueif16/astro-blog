import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import { markdown } from './src/utils/markdown.mjs';

// The blog and feed pages are rendered on request from the vault and cached by Vercel until the
// vault's workflows refresh them with this token, so a new post needs no deploy. Without it the
// cached pages would never refresh, so a Vercel build stops here.
const revalidateToken = process.env.REVALIDATE_TOKEN;
if (process.env.VERCEL && !revalidateToken) {
  throw new Error('REVALIDATE_TOKEN is not set; the blog and feed pages could never be refreshed.');
}

export default defineConfig({
  // Used for social preview images and links.
  site: 'https://me.infinityopus.com',
  output: 'static',
  adapter: vercel({
    imageService: true,
    isr: {
      bypassToken: revalidateToken,
    },
  }),

  markdown,

  experimental: {
    liveContentCollections: true,
  },

  integrations: [react()],
});
