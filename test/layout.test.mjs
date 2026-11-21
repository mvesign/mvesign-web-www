import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDist } from './helpers/dist.mjs';

const html = await readDist('index.html');

test('een link naar de inhoud, als eerste', () => {
  assert.match(html, /<body[^>]*>\s*<a class="skip" href="#inhoud">Naar de inhoud<\/a>/);
  assert.match(html, /<main id="inhoud">/);
});

test('het woordmerk staat in de HTML, met de groep mv voor het goud', () => {
  assert.match(html, /<a class="brand" href="\/" aria-label="mvesign, naar home">\s*<svg aria-hidden="true" focusable="false"/);
  assert.match(html, /<g class="mv"/);
});

test('het menu heeft drie items in het Nederlands', () => {
  for (const [href, label] of [['/notes/', 'Notities'], ['/projects/', 'Projecten'], ['/about/', 'Over mij']]) {
    assert.ok(html.includes(`href="${href}">${label}</a>`), label);
  }
});

test('de footer linkt naar GitHub, LinkedIn en Stack Overflow', () => {
  assert.ok(html.includes('href="https://github.com/mvesign"'));
  assert.match(html, /href="https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?">LinkedIn<\/a>/, 'LinkedIn-URL uit invoer 1');
  assert.ok(html.includes('href="https://stackoverflow.com/users/11607650/mvesign"'));
});
