import {
  Ollama,
  ChatRequest as OllamaChatRequest,
  ChatResponse as OllamaChatResponse,
  EmbedResponse as OllamaEmbedResponse,
} from 'ollama';
import {
  ChatResponse,
  ChatOptions,
  EmbedResponse,
  EmbedOptions,
  FinishReason,
  ConnectSessionOptions,
  PrivateModelSessionConnectionResponse,
} from '../types';
import {
  chatRequestSchema,
  embedOptionsSchema,
  connectSessionOptionsSchema,
} from '../validate';

import config from '../../lib/config';
import { formatZodError } from '../../lib/utils/format-zod-error';

export async function connectSession(
  sessionOptions: ConnectSessionOptions,
  ollamaClient: Ollama = new Ollama({ host: config.get('ollamaEndpoint') }),
): Promise<PrivateModelSessionConnectionResponse> {
  const result = connectSessionOptionsSchema.safeParse(sessionOptions);
  if (!result.success) {
    throw new Error(formatZodError(result.error));
  }
  try {
    // force ollama to load model. This is a workaround for the issue where the model is not loaded when the session is created.
    await ollamaClient.chat({
      model: result.data.model,
      messages: [
        {
          role: 'user',
          content: 'status check. Say "hello" to continue.',
        },
      ],
    });
    return {
      active: true,
      model: result.data.model,
    };
  } catch (error) {
    return {
      active: false,
      model: null,
    };
  }
}

export class Session {
  private client: Ollama;

  static create(): Session {
    return new Session(new Ollama({ host: config.get('ollamaEndpoint') }));
  }

  constructor(ollama: Ollama) {
    this.client = ollama;
  }

  static convertChatOptions(
    chatOptions: ChatOptions,
  ): OllamaChatRequest & { stream: false } {
    const { model, messages, format, options } = chatOptions;

    const filteredOptions = options
      ? Session.filterOptions(options)
      : undefined;

    return {
      stream: false,
      model,
      messages,
      ...(format && { format }),
      ...(filteredOptions && { options: filteredOptions }),
    };
  }

  private static filterOptions(options: ChatOptions['options']) {
    return {
      ...(options?.temperature != null && { temperature: options.temperature }),
      ...(options?.stop != null && { stop: options.stop }),
      ...(options?.seed != null && { seed: options.seed }),
      ...(options?.repeat_penalty !== undefined && {
        repeat_penalty: options.repeat_penalty,
      }),
      ...(options?.presence_penalty !== undefined && {
        presence_penalty: options.presence_penalty,
      }),
      ...(options?.frequency_penalty !== undefined && {
        frequency_penalty: options.frequency_penalty,
      }),
      ...(options?.top_k !== undefined && { top_k: options.top_k }),
      ...(options?.top_p !== undefined && { top_p: options.top_p }),
    };
  }

  static convertOllamaChatResponse(response: OllamaChatResponse): ChatResponse {
    // Generate a random ID (you might want to use a more robust ID generation method)
    const id = Math.random().toString(36).substring(2, 15);

    return {
      id,
      choices: [
        {
          message: response.message,
          finish_reason: response.done_reason as FinishReason,
        },
      ],
      created: response.created_at,
      model: response.model,
      usage: {
        total_duration: response.total_duration,
        load_duration: response.load_duration,
        prompt_eval_count: response.prompt_eval_count,
        prompt_eval_duration: response.prompt_eval_duration,
        eval_count: response.eval_count,
        eval_duration: response.eval_duration,
      },
    };
  }

  static convertOllamaEmbedResponse(
    response: OllamaEmbedResponse,
  ): EmbedResponse & { stream: false } {
    const id = Math.random().toString(36).substring(2, 15);
    const { model, embeddings } = response;
    return {
      id,
      model,
      embeddings,
      stream: false,
    };
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const result = chatRequestSchema.strict().safeParse(options);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }
    return Session.convertOllamaChatResponse(
      await this.client.chat(Session.convertChatOptions(options)),
    );
  }

  async embed(options: EmbedOptions): Promise<EmbedResponse> {
    const result = embedOptionsSchema.safeParse(options);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    return Session.convertOllamaEmbedResponse(await this.client.embed(options));
  }
}
