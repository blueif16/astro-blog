import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import { markdown } from './src/utils/markdown.mjs';

export default defineConfig({
  // Used for social preview images and links.
  site: 'https://me.infinityopus.com',
  output: 'static',
  adapter: vercel({
    imageService: true,
  }),

  markdown,

  experimental: {
    liveContentCollections: true,
  },

  integrations: [react()],
});
