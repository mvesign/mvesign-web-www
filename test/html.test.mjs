import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlFiles, readDist } from './helpers/dist.mjs';

const pages = await htmlFiles();

test('dist/ bevat de home', () => {
  assert.ok(pages.includes('index.html'), 'dist/index.html ontbreekt: draai eerst npm run build');
});

for (const page of pages) {
  test(`${page}: Nederlands en zonder JavaScript`, async () => {
    const html = await readDist(page);
    assert.match(html, /<html lang="nl"/);
    assert.doesNotMatch(html, /<script/i);
  });
}
