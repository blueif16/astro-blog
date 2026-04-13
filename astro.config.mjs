import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import remarkObsidianCallout from 'remark-obsidian-callout';
import rehypePrettyCode from 'rehype-pretty-code';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  adapter: vercel({
    imageService: true,
  }),

  markdown: {
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
