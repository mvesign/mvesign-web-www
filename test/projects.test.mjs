import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { readDist } from './helpers/dist.mjs';

const slugs = (await readdir(new URL('../src/content/projects/', import.meta.url)))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.slice(0, -3));

test('er zijn projecten', () => {
  assert.ok(slugs.length >= 4);
});

test('/projects/ toont elk project', async () => {
  const html = await readDist('projects/index.html');
  for (const slug of slugs) assert.ok(html.includes(`href="/projects/${slug}/"`), slug);
});

test('een project met een openbaar repo linkt ernaar, de home server niet', async () => {
  const withRepo = await readDist('projects/brand-assets/index.html');
  assert.ok(withRepo.includes('href="https://github.com/mvesign/mvesign-brand-assets">Bekijk het repo op GitHub</a>'));
  const privateRepo = await readDist('projects/home-server/index.html');
  assert.ok(!privateRepo.includes('Bekijk het repo op GitHub'));
});

test('de tekst over de home server noemt geen adressen of mailboxen', async () => {
  const html = await readDist('projects/home-server/index.html');
  assert.doesNotMatch(html, /\b\d{1,3}(\.\d{1,3}){3}\b/, 'IP-adres');
  assert.doesNotMatch(html, /[\w.-]+@mvesign\.com/, 'mailbox');
  assert.doesNotMatch(html, /home\.mvesign\.com/, 'interne domeinnaam');
});
