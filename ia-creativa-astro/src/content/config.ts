import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date().optional(),
        updatedDate: z.date().optional(),
        heroImage: z.string().optional(),
        isFeatured: z.boolean().default(false),
        isGuide: z.boolean().default(false),
    }),
});

export const collections = {
    'blog': blogCollection,
};
