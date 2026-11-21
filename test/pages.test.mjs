import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist } from './helpers/dist.mjs';

test('de home toont de nieuwste notities en projecten', async () => {
  const html = await readDist('index.html');
  assert.ok(html.includes('href="/notes/sonarqube-serialization-pattern/"'));
  assert.ok(html.includes('href="/notes/">Alle notities</a>'));
  assert.ok(html.includes('href="/projects/">Alle projecten</a>'));
  assert.equal(html.match(/<h3><a href="\/projects\//g)?.length, 3, 'drie projecten');
});

test('Over mij staat er, met een titel', async () => {
  const html = await readDist('about/index.html');
  assert.match(html, /<h1>Over mij<\/h1>/);
});

test('de foutpagina is Nederlands en linkt naar home en notities', async () => {
  const html = await readDist('404.html');
  assert.match(html, /<h1>Pagina niet gevonden<\/h1>/);
  assert.ok(html.includes('href="/notes/">notities</a>'));
  assert.ok(html.includes('href="/">homepagina</a>'));
});
