import { test } from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { readDist } from './helpers/dist.mjs';

function newestNoteSlug() {
  const dir = new URL('../src/content/notes/', import.meta.url);
  const notes = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({
      slug: f.replace(/\.md$/, ''),
      date: readFileSync(new URL(f, dir), 'utf8').match(/^date: (\d{4}-\d{2}-\d{2})$/m)?.[1],
    }));
  assert.ok(notes.length > 0 && notes.every((n) => n.date), 'elke notitie heeft een date');
  return notes.sort((a, b) => b.date.localeCompare(a.date))[0].slug;
}

test('de home toont de nieuwste notities en projecten', async () => {
  const html = await readDist('index.html');
  assert.ok(html.includes(`href="/notes/${newestNoteSlug()}/"`), 'de nieuwste notitie staat op de home');
  assert.ok((html.match(/<h3><a href="\/notes\//g)?.length ?? 0) <= 5, 'hooguit vijf notities');
  assert.ok(html.includes('href="/notes/">Alle notities</a>'));
  assert.ok(html.includes('href="/projects/">Alle projecten</a>'));
  assert.ok((html.match(/<h3><a href="\/projects\//g)?.length ?? 0) <= 5, 'hooguit vijf projecten');
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
