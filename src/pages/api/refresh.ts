// GitHub calls this on every push to the vault (a repo webhook, not an Action). Each blog and feed
// page is cached by Vercel with its section's tag, so dropping the tag of each section the push
// changed makes the next visit to any of those pages render it fresh from the vault, no deploy.
// GitHub's webhook settings show each delivery with this response.
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { dangerouslyDeleteByTag } from '@vercel/functions';
import { changedFiles, signedBy, type Section } from '../../utils/refresh';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  if (!signedBy(body, request.headers.get('x-hub-signature-256'), getSecret('WEBHOOK_SECRET') ?? '')) {
    return new Response('Bad signature', { status: 401 });
  }
  // GitHub sends a ping when the webhook is made.
  if (request.headers.get('x-github-event') !== 'push') {
    return new Response('Nothing to refresh', { status: 202 });
  }

  const files = changedFiles(JSON.parse(body));
  const sections = (Object.keys(files) as Section[]).filter((section) => files[section].length > 0);
  if (sections.length === 0) {
    return new Response('Nothing to refresh', { status: 202 });
  }

  // Deleted rather than marked stale, so the first visit after a push already shows the new
  // version. A blog this size has no crowd to stampede the origin.
  await dangerouslyDeleteByTag(sections, { revalidationDeadlineSeconds: 0 });
  return new Response(`Refreshed ${sections.join(' and ')}`, { status: 200 });
};
