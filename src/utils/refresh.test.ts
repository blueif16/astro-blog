// Run with `npm test` (node --test; Node strips the types).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changedFiles, signedBy } from './refresh.ts';

// GitHub's own example from "Validating webhook deliveries".
const secret = "It's a Secret to Everybody";
const body = 'Hello, World!';
const signature = 'sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17';

test('accepts a body signed by GitHub with the secret', () => {
  assert.equal(signedBy(body, signature, secret), true);
});

test('rejects a body that was changed after signing', () => {
  assert.equal(signedBy('Hello, World?', signature, secret), false);
});

test('rejects a signature made with another secret', () => {
  assert.equal(signedBy(body, signature, 'another secret'), false);
});

test('rejects a request without a signature, or when no secret is set', () => {
  assert.equal(signedBy(body, null, secret), false);
  assert.equal(signedBy(body, signature, ''), false);
});

test('sorts the files a push to main changed into blog and feed', () => {
  const files = changedFiles({
    ref: 'refs/heads/main',
    commits: [
      { added: ['publish/blog/new.md', 'daily/2026-11-12.md'], removed: [], modified: ['resources/briefings/2026-11-12-briefing.md'] },
      { added: [], removed: ['publish/blog/old.md'], modified: ['publish/blog/new.md'] },
    ],
  });
  assert.deepEqual(files, {
    blog: ['publish/blog/new.md', 'publish/blog/old.md'],
    feed: ['resources/briefings/2026-11-12-briefing.md'],
  });
});

test('finds nothing to refresh in a push to another branch', () => {
  const files = changedFiles({ ref: 'refs/heads/feat/x', commits: [{ added: ['publish/blog/new.md'] }] });
  assert.deepEqual(files, { blog: [], feed: [] });
});
