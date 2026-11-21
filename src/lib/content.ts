import { getCollection, type CollectionEntry } from 'astro:content';
import { byDateDesc, byYearDescThenTitle } from './sort';

export type Note = CollectionEntry<'notes'>;

export async function getNotes(): Promise<Note[]> {
  return (await getCollection('notes')).sort(byDateDesc);
}

export type Project = CollectionEntry<'projects'>;

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort(byYearDescThenTitle);
}
