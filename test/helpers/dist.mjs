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
