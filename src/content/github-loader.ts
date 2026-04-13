import type { Loader } from 'astro/loaders';
import yaml from 'js-yaml';

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

/**
 * Astro content loader that fetches markdown files from a private GitHub repo
 * at build time using the GitHub API (Trees endpoint for efficiency).
 */
export function githubLoader(options: GitHubLoaderOptions): Loader {
  const { repo, path, pattern, token, branch = 'main' } = options;

  return {
    name: 'github-loader',
    load: async ({ store, parseData, generateDigest, renderMarkdown }) => {
      if (!token || !repo) {
        console.warn('[github-loader] VAULT_TOKEN or VAULT_REPO not set — feed collection will be empty');
        store.clear();
        return;
      }

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'astro-github-loader',
        'Authorization': `Bearer ${token}`,
      };

      // 1. Get the full repo tree to find matching files
      const treeUrl = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
      const treeRes = await fetch(treeUrl, { headers });

      if (!treeRes.ok) {
        const text = await treeRes.text();
        console.error(`[github-loader] GitHub API error (${treeRes.status}): ${text}`);
        store.clear();
        return;
      }

      const tree = await treeRes.json();
      const files: GitHubTreeItem[] = tree.tree.filter(
        (item: GitHubTreeItem) =>
          item.type === 'blob' &&
          item.path.startsWith(path + '/') &&
          pattern.test(item.path.split('/').pop() || '')
      );

      store.clear();

      // 2. Fetch each file's content via the blob endpoint
      for (const file of files) {
        const blobRes = await fetch(file.url, { headers });
        if (!blobRes.ok) continue;

        const blob = await blobRes.json();
        // GitHub blob content is base64 encoded
        const content = Buffer.from(blob.content, 'base64').toString('utf-8');

        // Parse frontmatter with proper YAML parser
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!fmMatch) continue;

        const frontmatter = yaml.load(fmMatch[1]) as Record<string, unknown> || {};

        const filename = file.path.split('/').pop() || '';
        const id = filename.replace(/\.md$/, '');

        const data = await parseData({
          id,
          data: frontmatter,
        });

        const digest = generateDigest(content);

        const rendered = await renderMarkdown(fmMatch[2]);

        store.set({
          id,
          data,
          body: fmMatch[2],
          rendered,
          digest,
        });
      }
    },
  };
}
