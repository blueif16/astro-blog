import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared schema for all sections
const contentSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

// Each folder under publish/ becomes a collection
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: contentSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: contentSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: contentSchema,
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: contentSchema,
});

const til = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/til' }),
  schema: contentSchema,
});

export const collections = { blog, notes, projects, guides, til };
