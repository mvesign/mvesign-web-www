import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist, readDistBytes, linkHrefs } from './helpers/dist.mjs';
import { pngSize } from './helpers/png.mjs';

test('og-default.png is 1200 × 630', async () => {
  assert.deepEqual(pngSize(await readDistBytes('og-default.png')), { width: 1200, height: 630 });
});

test('het webmanifest verwijst naar bestaande iconen van de juiste maat', async () => {
  const manifest = JSON.parse(await readDist('site.webmanifest'));
  assert.equal(manifest.name, 'mvesign');
  assert.equal(manifest.short_name, 'mvesign');
  assert.equal(manifest.display, 'browser');
  assert.match(manifest.theme_color, /^#[0-9A-F]{6}$/);
  assert.match(manifest.background_color, /^#[0-9A-F]{6}$/);
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes), ['192x192', '512x512']);
  for (const icon of manifest.icons) {
    const { width, height } = pngSize(await readDistBytes(icon.src.slice(1)));
    assert.equal(`${width}x${height}`, icon.sizes, icon.src);
  }
});

test('de home verwijst naar het webmanifest', async () => {
  assert.deepEqual(linkHrefs(await readDist('index.html'), 'manifest'), ['/site.webmanifest']);
});
