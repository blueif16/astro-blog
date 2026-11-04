import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import remarkObsidianCallout from 'remark-obsidian-callout';
import rehypePrettyCode from 'rehype-pretty-code';
import react from '@astrojs/react';

export default defineConfig({
  // Used for social preview images and links.
  site: 'https://me.infinityopus.com',
  output: 'static',
  adapter: vercel({
    imageService: true,
  }),

  markdown: {
    // Code blocks go to rehype-pretty-code below, not Astro's own highlighter.
    syntaxHighlight: false,
    remarkPlugins: [
      remarkObsidianCallout,
    ],
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: 'github-light',
        defaultLang: 'plaintext',
      }],
    ],
  },

  integrations: [react()],
});
