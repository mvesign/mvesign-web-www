import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { readDist, metaAll } from './helpers/dist.mjs';

const slugs = (await readdir(new URL('../src/content/notes/', import.meta.url)))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.slice(0, -3));

test('er zijn notities', () => {
  assert.ok(slugs.length >= 2);
});

test('/notes/ toont elke notitie', async () => {
  const html = await readDist('notes/index.html');
  for (const slug of slugs) assert.ok(html.includes(`href="/notes/${slug}/"`), slug);
});

for (const slug of slugs) {
  test(`notes/${slug}/: een artikel met datum en een link naar het bronbestand`, async () => {
    const html = await readDist(`notes/${slug}/index.html`);
    assert.deepEqual(metaAll(html, 'og:type'), ['article']);
    assert.equal(metaAll(html, 'article:published_time').length, 1);
    assert.match(html, /<time datetime="\d{4}-\d{2}-\d{2}">\d{1,2} [a-z]+ \d{4}<\/time>/);
    assert.ok(html.includes(`href="https://github.com/mvesign/mvesign-web-www/blob/main/src/content/notes/${slug}.md"`));
  });
}

test('codeblokken hebben een licht en een donker thema', async () => {
  const html = await readDist('notes/sonarqube-serialization-pattern/index.html');
  assert.match(html, /<pre class="astro-code/);
  assert.match(html, /--shiki-dark/);
});

test('"Bekijk de code op GitHub" alleen bij een notitie met source', async () => {
  const withSource = await readDist('notes/dotnetcore-cancellation-tokens/index.html');
  assert.ok(withSource.includes('href="https://github.com/mvesign/dotnetcore-cancellation-tokens">Bekijk de code op GitHub</a>'));
  const withoutSource = await readDist('notes/sonarqube-serialization-pattern/index.html');
  assert.ok(!withoutSource.includes('Bekijk de code op GitHub'));
});
