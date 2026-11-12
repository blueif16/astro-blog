import type { LiveLoader } from 'astro/loaders';
import { createMarkdownProcessor, type MarkdownProcessor } from '@astrojs/markdown-remark';
import yaml from 'js-yaml';
import { markdown } from './markdown.mjs';

interface GitHubLoaderOptions {
  repo: string;       // "owner/repo"
  path: string;       // directory path in repo, e.g. "resources/briefings"
  pattern: RegExp;    // filename filter, e.g. /.*-briefing\.md$/
  token: string;
  branch?: string;
}

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  url: string;
}

// The frontmatter, plus the markdown under it as `body`.
type EntryData = Record<string, unknown> & { body: string };

// A blob's URL names its content, so a text fetched once never goes stale.
const blobs = new Map<string, string>();
let processor: Promise<MarkdownProcessor> | undefined;

/**
 * Astro live loader that fetches markdown files from a private GitHub repo when a page is
 * rendered, using the GitHub API (Trees endpoint for efficiency). Vercel caches the pages
 * (astro.config.mjs), so this runs when a page is first asked for or is refreshed.
 *
 * Any failure is returned as an error rather than an empty collection: a page rendered from
 * half the posts would be cached as if it were whole.
 */
export function githubLoader(options: GitHubLoaderOptions): LiveLoader<EntryData, { id: string }> {
  const { repo, path, pattern, token, branch = 'main' } = options;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'astro-github-loader',
    'Authorization': `Bearer ${token}`,
  };

  // 1. Get the full repo tree to find matching files
  async function listFiles(): Promise<GitHubTreeItem[]> {
    if (!token || !repo) {
      throw new Error('VAULT_TOKEN or VAULT_REPO not set');
    }

    const treeUrl = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
    const treeRes = await fetch(treeUrl, { headers });
    if (!treeRes.ok) {
      throw new Error(`GitHub API error (${treeRes.status}): ${await treeRes.text()}`);
    }

    const tree = await treeRes.json();
    return tree.tree.filter(
      (item: GitHubTreeItem) =>
        item.type === 'blob' &&
        item.path.startsWith(path + '/') &&
        pattern.test(item.path.split('/').pop() || '')
    );
  }

  const idOf = (file: GitHubTreeItem) => (file.path.split('/').pop() || '').replace(/\.md$/, '');

  // 2. Fetch a file's content via the blob endpoint
  async function readFile(file: GitHubTreeItem) {
    const id = idOf(file);
    let content = blobs.get(file.sha);
    if (content === undefined) {
      const blobRes = await fetch(file.url, { headers });
      if (!blobRes.ok) {
        throw new Error(`GitHub API error (${blobRes.status}) reading ${file.path}`);
      }
      const blob = await blobRes.json();
      // GitHub blob content is base64 encoded
      content = Buffer.from(blob.content, 'base64').toString('utf-8');
      blobs.set(file.sha, content);
    }

    // Parse frontmatter with proper YAML parser
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return undefined;

    const frontmatter = yaml.load(fmMatch[1]) as Record<string, unknown> || {};
    return { id, data: { ...frontmatter, body: fmMatch[2] } };
  }

  return {
    name: 'github-loader',
    loadCollection: async () => {
      try {
        const files = await listFiles();
        const entries = [];
        // A few at a time, to stay inside GitHub's limit on concurrent requests.
        for (let i = 0; i < files.length; i += 20) {
          const read = await Promise.all(files.slice(i, i + 20).map(readFile));
          entries.push(...read.filter((entry) => entry !== undefined));
        }
        return { entries };
      } catch (error) {
        return { error: new Error(`Failed to load ${repo}/${path}`, { cause: error }) };
      }
    },
    loadEntry: async ({ filter }) => {
      try {
        const file = (await listFiles()).find((item) => idOf(item) === filter.id);
        const entry = file && await readFile(file);
        if (!entry) return undefined;

        processor ??= createMarkdownProcessor(markdown);
        const { code, metadata } = await (await processor).render(entry.data.body);
        // render() reads the headings from here, for a post's contents.
        const rendered = { html: code, metadata };
        return { ...entry, rendered };
      } catch (error) {
        return { error: new Error(`Failed to load ${repo}/${path}/${filter.id}.md`, { cause: error }) };
      }
    },
  };
}
