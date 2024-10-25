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

export type ModelName = string;

export type Message = z.infer<typeof messageSchema>;

export type ChatOptions = z.infer<typeof chatRequestSchema>;

export type FinishReason =
  | 'stop'
  | 'length'
  | 'tool_calls'
  | 'content_filter'
  | 'function_call';

export interface ChatChoice {
  message: Message;
  finish_reason: FinishReason;
}

interface ChatResponseUsage {
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export interface ChatResponse {
  id: string;
  choices: Array<ChatChoice>;
  created: Date;
  model: string;
  usage: ChatResponseUsage;
}

export interface LoadModelStatus {
  status: string;
  message?: string;
}

export type EmbedOptions = z.infer<typeof embedOptionsSchema>;

export interface EmbedResponse {
  id: string;
  model: string;
  embeddings: number[][];
}

export interface RequestOptions {
  model: ModelName;
  silent?: boolean;
}

export type EnabledModel = {
  enabled: boolean;
  model: string;
};

export interface PermissionProperties {
  models: () => Promise<EnabledModel[]>;
  request: (options: RequestOptions) => Promise<boolean>;
}

export interface ModelSession {
  chat: (options: ChatOptions) => Promise<ChatResponse>;
  embed: (options: EmbedOptions) => Promise<EmbedResponse>;
}

export interface PrivateModelSessionConnectionResponse {
  active: boolean;
  model: string | null;
}

export type ConnectSessionOptions = z.infer<typeof connectSessionOptionsSchema>;

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

export interface ModelProperties {
  connect(options: ConnectSessionOptions): Promise<ModelSession>;
  info(options: ModelInfoOptions): Promise<ModelInfo>;
}

export interface WindowAIBinding {
  permissions: PermissionProperties;
  model: ModelProperties;
}

export interface WindowAIHandler {
  permissions: PermissionProperties;
  model: Omit<ModelProperties, 'connect'> & {
    connect: (
      options: ConnectSessionOptions,
    ) => Promise<PrivateModelSessionConnectionResponse>;
  };
}
