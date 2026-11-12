import { createHmac, timingSafeEqual } from 'node:crypto';

// Where each section's files are in the vault, as in src/live.config.ts. Each section's pages
// carry its name as their Vercel cache tag.
const sources = { blog: 'publish/blog/', feed: 'resources/briefings/' } as const;
export type Section = keyof typeof sources;

interface PushEvent {
  ref?: string;
  commits?: { added?: string[]; removed?: string[]; modified?: string[] }[];
}

/** Whether `signature` (GitHub's X-Hub-Signature-256 header) is `body` signed with `secret`. */
export function signedBy(body: string, signature: string | null, secret: string) {
  if (!secret || !signature) return false;
  const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(body).digest('hex')}`);
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** The vault files a push changed, by section. The site reads only main, so other branches change nothing. */
export function changedFiles(push: PushEvent): Record<Section, string[]> {
  const files = push.ref === 'refs/heads/main'
    ? [...new Set((push.commits ?? []).flatMap((c) => [...c.added ?? [], ...c.removed ?? [], ...c.modified ?? []]))]
    : [];
  return {
    blog: files.filter((f) => f.startsWith(sources.blog)),
    feed: files.filter((f) => f.startsWith(sources.feed)),
  };
}
