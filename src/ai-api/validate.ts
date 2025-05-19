import { z } from 'zod';

export const modelNameSchema = z.string().describe('name of the model');

export const messageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

const optionsSchema = z.object({
  temperature: z.number(),
  stop: z.array(z.string()),
  seed: z.number().optional(),
  repeat_penalty: z.number(),
  presence_penalty: z.number(),
  frequency_penalty: z.number(),
  top_k: z.number(),
  top_p: z.number(),
});

const toolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.object({
      type: z.literal('object'),
      required: z.array(z.string()),
      properties: z.record(
        z.object({
          type: z.string(),
          description: z.string(),
        }),
      ),
    }),
  }),
});

export const chatRequestSchema = z.object({
  model: modelNameSchema,
  messages: z.array(messageSchema),
  // stream: z.boolean().optional(),
  format: z.string().optional(),
  tools: z.array(toolSchema).optional(),
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
