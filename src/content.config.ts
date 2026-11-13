import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const text = z.string().min(1);
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/lessons' }),
  schema: z.object({
    id: text.regex(/^[a-z0-9-]+$/),
    order: z.number().int().nonnegative(),
    chapter: z.number().int().min(1).max(16),
    title: text,
    summary: text,
    scenario: text,
    concept: text,
    analogy: text,
    result: text,
    pitfall: text,
    practice: text,
    level: text,
    minutes: z.number().positive(),
    visual: text,
    steps: z.array(z.object({ title: text, command: text, explanation: text })).min(2),
    commands: z.array(text).min(1),
    quiz: z
      .object({
        question: text,
        options: z.array(text).min(2),
        answer: z.number().int().nonnegative(),
        explanation: text,
      })
      .refine((q) => q.answer < q.options.length, 'Jawaban kuis harus merujuk opsi yang ada.'),
    prerequisites: z.array(text),
    initialState: text,
    lab: text,
    objectives: z.array(text).min(1),
    sources: z.array(z.object({ title: text, url: z.url() })).min(1),
    verification: z.object({ command: text, explanation: text }),
    preparationURL: z.string().optional(),
    checkpoint: z
      .object({
        question: text,
        options: z.array(text).min(2),
        answer: z.number().int().nonnegative(),
        explanation: text,
      })
      .refine((q) => q.answer < q.options.length, 'Jawaban tantangan harus merujuk opsi yang ada.')
      .optional(),
  }),
});

export const collections = { lessons };
