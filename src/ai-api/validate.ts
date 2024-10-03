import { z } from 'zod';

export const modelNameSchema = z.string().describe('name of the model');

export const messageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

const optionsSchema = z.object({
  temperature: z.number().nullable(),
  stop: z.string().nullable(),
  seed: z.number().nullable(),
  repeat_penalty: z.number(),
  presence_penalty: z.number(),
  frequency_penalty: z.number(),
  top_k: z.number(),
  top_p: z.number(),
});

export const chatRequestSchema = z.object({
  model: modelNameSchema,
  messages: z.array(messageSchema),
  // stream: z.boolean().optional(),
  format: z.string().optional(),
  options: optionsSchema.partial().optional(),
});

export const modelInfoOptionsSchema = z.object({
  model: modelNameSchema,
});

export const embedOptionsSchema = z.object({
  model: modelNameSchema,
  input: z.union([z.string(), z.array(z.string())]),
  truncate: z.boolean().optional(),
  keep_alive: z.union([z.string(), z.number()]).optional(),
  options: optionsSchema.partial().optional(),
});

export const connectSessionOptionsSchema = z.object({
  model: modelNameSchema,
});

export const ollamaHostUrlSchema = z
  .string()
  .url()
  .describe('Ollama Server Url (default: http://localhost:11434)');
