import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { readDist } from './helpers/dist.mjs';

const noteCount = (await readdir(new URL('../src/content/notes/', import.meta.url))).filter((file) => file.endsWith('.md')).length;

test('rss.xml heeft een item per notitie en is Nederlands', async () => {
  const xml = await readDist('rss.xml');
  assert.equal(xml.match(/<item>/g)?.length, noteCount);
  assert.ok(xml.includes('<language>nl-NL</language>'));
  assert.ok(xml.includes('<link>https://mvesign.com/notes/sonarqube-serialization-pattern/</link>'));
});

test('de sitemap noemt de pagina\'s, maar niet de foutpagina', async () => {
  assert.ok((await readDist('sitemap-index.xml')).includes('<loc>https://mvesign.com/sitemap-0.xml</loc>'));
  const sitemap = await readDist('sitemap-0.xml');
  assert.ok(sitemap.includes('<loc>https://mvesign.com/notes/</loc>'));
  assert.ok(!sitemap.includes('404'));
});

test('robots.txt verwijst naar de sitemap', async () => {
  assert.match(await readDist('robots.txt'), /^Sitemap: https:\/\/mvesign\.com\/sitemap-index\.xml$/m);
});

test('de pagina\'s verwijzen naar de feed', async () => {
  const html = await readDist('index.html');
  assert.match(html, /<link rel="alternate" type="application\/rss\+xml" title="mvesign" href="\/rss\.xml"/);
  assert.ok(html.includes('href="/rss.xml">RSS</a>'));
});
