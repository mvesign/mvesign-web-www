import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getNotes } from '../lib/content';
import { SITE } from '../site';

export async function GET(context: APIContext) {
  const notes = await getNotes();
  return rss({
    title: 'mvesign',
    description: 'Korte notities over problemen die ik tegenkwam in mijn werk, en hoe ik ze oploste.',
    site: context.site ?? SITE.url,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.date,
      link: `/notes/${note.id}/`,
    })),
    customData: '<language>nl-NL</language>',
  });
}
