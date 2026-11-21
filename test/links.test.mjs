import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlFiles, readDist, existsInDist } from './helpers/dist.mjs';

const pages = await htmlFiles();

for (const page of pages) {
  test(`${page}: elke interne link en verwijzing bestaat`, async () => {
    const html = await readDist(page);
    const refs = new Set(
      [...html.matchAll(/\s(?:href|src)="(\/[^"#?]*)/g)].map((match) => match[1]).filter((ref) => !ref.startsWith('//')),
    );
    for (const ref of refs) {
      const target = ref.endsWith('/') ? `${ref.slice(1)}index.html` : ref.slice(1);
      assert.ok(await existsInDist(target), `${ref} in ${page}`);
    }
  });
}
