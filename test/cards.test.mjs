import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { readDist } from './helpers/dist.mjs';

const countMarkdown = async (dir) =>
  (await readdir(new URL(`../src/content/${dir}/`, import.meta.url))).filter((file) => file.endsWith('.md')).length;
const noteCount = await countMarkdown('notes');
const projectCount = await countMarkdown('projects');
const HOME_MAX = 5;

/** De positie na de </ul> die de <ul> op positie start sluit; geneste lijsten (tags) tellen mee. */
function endOfList(html, start) {
  const tags = /<ul\b|<\/ul>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (let tag = tags.exec(html); tag; tag = tags.exec(html)) {
    depth += tag[0] === '</ul>' ? -1 : 1;
    if (depth === 0) return tags.lastIndex;
  }
  throw new Error(`geen </ul> bij positie ${start}`);
}

/** Elke lijst met blokken op een pagina: de soort (grid of rail), de attributen en de blokken. */
function cardLists(html) {
  return [...html.matchAll(/<ul class="cards (cards-grid|cards-rail)"([^>]*)>/g)].map((start) => {
    const body = html.slice(start.index, endOfList(html, start.index));
    return {
      kind: start[1],
      attrs: start[2],
      cards: body.split(/<li class="card"(?=[ >])/).slice(1),
    };
  });
}

test('/notes/ toont elke notitie als blok in een grid', async () => {
  const lists = cardLists(await readDist('notes/index.html'));
  assert.deepEqual(lists.map((list) => list.kind), ['cards-grid']);
  assert.equal(lists[0].cards.length, noteCount);
  for (const card of lists[0].cards) assert.ok(card.includes('Lees de notitie'), 'oproep in het blok');
});

test('/projects/ toont elk project als blok in een grid', async () => {
  const lists = cardLists(await readDist('projects/index.html'));
  assert.deepEqual(lists.map((list) => list.kind), ['cards-grid']);
  assert.equal(lists[0].cards.length, projectCount);
  for (const card of lists[0].cards) assert.ok(card.includes('Bekijk het project'), 'oproep in het blok');
});

test('de home heeft twee carousels, notities en projecten, met hooguit vijf blokken', async () => {
  const lists = cardLists(await readDist('index.html'));
  assert.deepEqual(lists.map((list) => list.kind), ['cards-rail', 'cards-rail']);
  const [notes, projects] = lists;
  assert.match(notes.attrs, /aria-labelledby="nieuwste-notities"/);
  assert.match(projects.attrs, /aria-labelledby="projecten"/);
  assert.equal(notes.cards.length, Math.min(HOME_MAX, noteCount));
  assert.equal(projects.cards.length, Math.min(HOME_MAX, projectCount));
});

test('een carousel is met het toetsenbord te bereiken en heeft een naam die bestaat', async () => {
  const html = await readDist('index.html');
  const rails = cardLists(html).filter((list) => list.kind === 'cards-rail');
  assert.ok(rails.length > 0, 'geen carousels op de home');
  for (const rail of rails) {
    assert.match(rail.attrs, /tabindex="0"/);
    const id = rail.attrs.match(/aria-labelledby="([^"]+)"/)?.[1];
    assert.ok(id && html.includes(`id="${id}"`), `het label ${id} bestaat`);
  }
});

test('een carousel noemt zijn aantal blokken, zodat CSS de stippen weglaat als er niets te scrollen is', async () => {
  const rails = cardLists(await readDist('index.html'));
  assert.ok(rails.length > 0, 'geen carousels op de home');
  for (const rail of rails) assert.match(rail.attrs, new RegExp(`data-count="${rail.cards.length}"`));
});

test('elk blok in een carousel heeft zijn titel als naam voor zijn stip', async () => {
  const cards = cardLists(await readDist('index.html')).flatMap((list) => list.cards);
  assert.ok(cards.length > 0, 'geen blokken op de home');
  for (const card of cards) {
    const title = card.match(/<h3><a [^>]*>([^<]+)<\/a><\/h3>/)?.[1];
    assert.ok(title, 'titel van het blok');
    assert.ok(card.startsWith(` data-title="${title}">`), `data-title bij ${title}`);
  }
});

test('elk blok heeft precies één link, naar zijn eigen pagina', async () => {
  for (const page of ['index.html', 'notes/index.html', 'projects/index.html']) {
    const cards = cardLists(await readDist(page)).flatMap((list) => list.cards);
    assert.ok(cards.length > 0, `${page}: geen blokken`);
    for (const card of cards) {
      const hrefs = [...card.matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);
      assert.equal(hrefs.length, 1, `${page}: ${hrefs.join(', ')}`);
      assert.match(hrefs[0], /^\/(notes|projects)\/[\w-]+\/$/, page);
    }
  }
});
