import remarkObsidianCallout from 'remark-obsidian-callout';
import rehypePrettyCode from 'rehype-pretty-code';

// How posts are turned into HTML. astro.config.mjs and the GitHub loader (which renders posts on
// request) both use it, so a post reads the same either way.
export const markdown = {
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
};
