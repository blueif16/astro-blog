import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import remarkObsidianCallout from 'remark-obsidian-callout';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourdomain.com',
  output: 'static',
  adapter: vercel(),
  markdown: {
    remarkPlugins: [
      remarkObsidianCallout,
      remarkMath,
    ],
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: 'github-light',
        defaultLang: 'plaintext',
      }],
      rehypeKatex,
    ],
  },
});
