// Hulpfuncties voor tests op de gebouwde site in dist/. Draai eerst npm run build.
import { readdir, readFile, access } from 'node:fs/promises';

export const DIST = new URL('../../dist/', import.meta.url);

/** Alle HTML-bestanden in dist/, als paden met / ten opzichte van dist/, gesorteerd. */
export async function htmlFiles() {
  let entries;
  try {
    entries = await readdir(DIST, { recursive: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .map((path) => path.replaceAll('\\', '/'))
    .filter((path) => path.endsWith('.html'))
    .sort();
}

export function readDist(path) {
  return readFile(new URL(path, DIST), 'utf8');
}

export function readDistBytes(path) {
  return readFile(new URL(path, DIST));
}

export async function existsInDist(path) {
  try {
    await access(new URL(path, DIST));
    return true;
  } catch {
    return false;
  }
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Alle waarden van content bij <meta name="key"> of <meta property="key">. */
export function metaAll(html, key) {
  const re = new RegExp(`<meta (?:name|property)="${escapeRegExp(key)}" content="([^"]*)"`, 'g');
  return [...html.matchAll(re)].map((match) => match[1]);
}

/** Alle href's bij <link rel="rel" href="...">. */
export function linkHrefs(html, rel) {
  const re = new RegExp(`<link rel="${escapeRegExp(rel)}" href="([^"]*)"`, 'g');
  return [...html.matchAll(re)].map((match) => match[1]);
}

/** De volledige URL van een pagina in dist/: notes/foo/index.html wordt https://mvesign.com/notes/foo/. */
export function pageUrl(page) {
  return `https://mvesign.com/${page.replace(/index\.html$/, '')}`;
}
