import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Valorferrum'),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['de', 'en']).default('de')
  })
});

export const collections = { blog };