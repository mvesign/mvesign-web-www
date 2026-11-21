// De schema's van de inhoud. Mist een veld of klopt het type niet, dan faalt de build.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  // Alleen *.md op dit niveau: mappen met afbeeldingen naast een notitie zijn geen notitie.
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    date: z.coerce.date(),
    tags: z.array(z.string().min(1)).min(1),
    source: z.url().optional(),
  }),
});

export const collections = { notes };
