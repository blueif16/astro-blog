import { defineLiveCollection, z } from 'astro:content';
import { getSecret } from 'astro:env/server';
import { githubLoader } from './utils/github-loader';

// Both collections are read from the vault's main branch when a page is rendered, not at build.
const repo = getSecret('VAULT_REPO') || 'blueif16/brain';
const token = getSecret('VAULT_TOKEN') || '';

const contentSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  body: z.string(),
});

const blog = defineLiveCollection({
  loader: githubLoader({
    repo,
    path: 'publish/blog',
    pattern: /\.md$/,
    token,
    branch: 'main',
  }),
  schema: contentSchema,
});

const feed = defineLiveCollection({
  loader: githubLoader({
    repo,
    path: 'resources/briefings',
    pattern: /.*-briefing\.md$/,
    token,
    branch: 'main',
  }),
  schema: z.object({
    type: z.string().default('briefing'),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    body: z.string(),
  }),
});

export const collections = { blog, feed };
