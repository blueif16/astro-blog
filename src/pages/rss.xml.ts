import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const allPosts = await Promise.all([
    getCollection('blog'),
    getCollection('notes'),
    getCollection('projects'),
    getCollection('guides'),
    getCollection('til'),
  ]).then(collections => collections.flat());

  const posts = allPosts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Shiran',
    description: 'Personal blog and notes',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/${post.collection}/${post.id}/`,
    })),
  });
}
