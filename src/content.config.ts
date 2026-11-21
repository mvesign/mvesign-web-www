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

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    year: z.number().int(),
    stack: z.array(z.string().min(1)).min(1),
    repo: z.url().optional(),
  }),
});

export const collections = { notes, projects };
