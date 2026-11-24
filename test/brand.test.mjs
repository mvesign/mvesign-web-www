import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const siteCss = readFileSync(new URL('../src/styles/site.css', import.meta.url), 'utf8');
const tokensCss = readFileSync(require.resolve('mvesign-brand-assets/tokens.css'), 'utf8');

test('site.css gebruikt alleen custom properties die de huisstijl heeft', () => {
  const used = [...new Set([...siteCss.matchAll(/var\((--mv-[a-z0-9-]+)/g)].map((match) => match[1]))];
  assert.ok(used.length > 0, 'site.css gebruikt geen --mv-properties');
  for (const name of used) assert.ok(tokensCss.includes(`${name}:`), `${name} bestaat niet in tokens.css`);
});

test('codeblokken krijgen de achtergrond van de huisstijl, niet die van Shiki', () => {
  assert.match(siteCss, /\.astro-code\s*\{[^}]*background-color:\s*var\(--mv-surface\)/);
  assert.doesNotMatch(siteCss, /--shiki-dark-bg/);
});
