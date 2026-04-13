import { defineCollection, z } from 'astro:content';
import { githubLoader } from './github-loader';

const contentSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const blog = defineCollection({
  loader: githubLoader({
    repo: import.meta.env.VAULT_REPO || 'blueif16/brain',
    path: 'publish/blog',
    pattern: /\.md$/,
    token: import.meta.env.VAULT_TOKEN || '',
    branch: 'main',
  }),
  schema: contentSchema,
});

const feed = defineCollection({
  loader: githubLoader({
    repo: import.meta.env.VAULT_REPO || 'blueif16/brain',
    path: 'resources/briefings',
    pattern: /.*-briefing\.md$/,
    token: import.meta.env.VAULT_TOKEN || '',
    branch: 'main',
  }),
  schema: z.object({
    type: z.string().default('briefing'),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, feed };
