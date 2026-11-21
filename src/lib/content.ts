import { getCollection, type CollectionEntry } from 'astro:content';
import { byDateDesc } from './sort';

export type Note = CollectionEntry<'notes'>;

export async function getNotes(): Promise<Note[]> {
  return (await getCollection('notes')).sort(byDateDesc);
}
