import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { htmlFiles, readDist, existsInDist, metaAll, linkHrefs, pageUrl } from './helpers/dist.mjs';

const pages = await htmlFiles();

for (const page of pages) {
  test(`${page}: <head> voor zoekmachines en delen`, async () => {
    const html = await readDist(page);
    assert.equal(html.match(/<title>/g)?.length, 1, 'precies één <title>');
    assert.equal(metaAll(html, 'description').length, 1, 'description');
    for (const key of ['og:title', 'og:description', 'og:type', 'og:site_name']) {
      assert.equal(metaAll(html, key).length, 1, key);
    }
    assert.deepEqual(metaAll(html, 'og:locale'), ['nl_NL']);
    assert.deepEqual(metaAll(html, 'og:image'), ['https://mvesign.com/og-default.png']);
    if (page === '404.html') {
      assert.deepEqual(metaAll(html, 'robots'), ['noindex']);
      assert.deepEqual(linkHrefs(html, 'canonical'), []);
      assert.deepEqual(metaAll(html, 'og:url'), []);
    } else {
      assert.deepEqual(linkHrefs(html, 'canonical'), [pageUrl(page)]);
      assert.deepEqual(metaAll(html, 'og:url'), [pageUrl(page)]);
    }
  });
}

test('de favicon en de apple-touch-icon komen uit _astro/ en bestaan', async () => {
  const html = await readDist('index.html');
  for (const rel of ['icon', 'apple-touch-icon']) {
    const hrefs = linkHrefs(html, rel);
    assert.equal(hrefs.length, 1, rel);
    assert.match(hrefs[0], /^\/_astro\//, `${rel} is geen bestand in _astro/ (ingevoegd als data-URL?)`);
    assert.ok(await existsInDist(hrefs[0].slice(1)), hrefs[0]);
  }
});

test('site.css gebruikt alleen kleuren uit de huisstijl', async () => {
  const css = await readFile(new URL('../src/styles/site.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
});
