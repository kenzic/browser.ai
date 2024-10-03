import { z } from 'zod';
import {
  chatRequestSchema,
  connectSessionOptionsSchema,
  embedOptionsSchema,
  messageSchema,
  modelInfoOptionsSchema,
} from './validate';

export interface Site {
  name: string;
  host: string;
  permission: boolean;
}

export interface UserPreferences {
  availableModels: string[];
  ollamaHost: string;
  sites: Site[];
}

// @final
export type ModelName = string;

// // @final
// interface Options {
//   temperature: number | null; // The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)
//   stop: string | null; // Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return.
//   seed: number | null; // Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (Default: 0)
//   repeat_penalty: number;
//   presence_penalty: number;
//   frequency_penalty: number;
//   top_k: number;
//   top_p: number; // Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)
// }

export type ConnectSessionOptions = z.infer<typeof connectSessionOptionsSchema>;

// @final
export type Message = z.infer<typeof messageSchema>;

// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values

export type ChatOptions = z.infer<typeof chatRequestSchema>;

export type FinishReason =
  | 'stop'
  | 'length'
  | 'tool_calls'
  | 'content_filter'
  | 'function_call';

// @final
export interface ChatChoice {
  message: Message;
  finish_reason: FinishReason;
}

// @final
interface ChatResponseUsage {
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

// @final
export interface ChatResponse {
  id: string; // ?
  choices: Array<ChatChoice>;
  created: Date;
  model: string;
  usage: ChatResponseUsage;
}

export interface LoadModelStatus {
  status: string;
  message?: string;
}

export type ModelInfoOptions = z.infer<typeof modelInfoOptionsSchema>;

interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface ModelInfo {
  model: string;
  license: string;
  details: ModelDetails;
}

export type EmbedOptions = z.infer<typeof embedOptionsSchema>;

export interface EmbedResponse {
  model: string;
  embeddings: number[][];
}

export interface ModelSession {
  chat: (options: ChatOptions) => Promise<ChatResponse>;
  embed: (options: EmbedOptions) => Promise<EmbedResponse>;
}

export type RequestFuncOptions = { model: ModelName };

export type ModelResponse = {
  name: ModelName;
  model: string;
};

export interface Permissions {
  models: () => Promise<ModelResponse[]>;
  request: (options: RequestFuncOptions) => Promise<boolean>;
}
export interface ModelProp {
  connect(options: ConnectSessionOptions): Promise<ModelSession>;
  info(options: ModelInfoOptions): Promise<ModelInfo>;
}
export interface AI {
  permissions: Permissions;
  model: ModelProp;
}
