import { ListResponse } from 'ollama';

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


export interface Options {
  numa: boolean
  num_ctx: number
  num_batch: number
  num_gpu: number // no
  main_gpu: number // no
  low_vram: boolean
  f16_kv: boolean
  logits_all: boolean
  vocab_only: boolean
  use_mmap: boolean // no
  use_mlock: boolean // no
  embedding_only: boolean
  num_thread: number // no

  // Runtime options
  num_keep: number
  seed: number  // yes
  num_predict: number
  top_k: number // yes
  top_p: number // yes
  tfs_z: number
  typical_p: number
  repeat_last_n: number
  temperature: number // yes
  repeat_penalty: number
  presence_penalty: number
  frequency_penalty: number // yes
  mirostat: number // no
  mirostat_tau: number // no
  mirostat_eta: number // no
  penalize_newline: boolean // no
  stop: string[] // yes
}


export type ChatModelSession = {
  chat: (messages: Message[]) => Promise<ChatResponse>
}

export type EmbeddingModelSession = {
  embed: (input: string | string[]) => Promise<EmbedResponse>
}

export interface CreateSessionOptions {
  model: string;
}

export interface ConnectModelConfig {
  model: string;
  timeout?: number;
  maxRetries?: number;
}

export interface Message {
  role: string;
  content: string;
}

// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values


export interface EmbedOptions {
  model: ModelName;
  input: string;
}

export interface ChatRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  format?: 'json' | 'plain';
  options: Partial<Options>;
}

export interface ChatChoice {
  message: Message;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call';
}

export interface ChatResponse {
  id: string; // ?
  choices: Array<ChatChoice>;
  created: number;
  model: string;
  usage: {
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
  };
}

export interface LoadModelStatus {
  status: string;
  message?: string;
}

export interface ModelInfoRequest {
  model: string;
}

export type ModelInfo = {
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  }
}

export interface ModelEnabledRequest {
  model: string;
};



export interface EmbedRequest {
  model: string;
  input: string | string[];
  truncate?: boolean;
  keep_alive?: string | number;
  options?: Partial<Options>;
}

export interface EmbedResponse {
  model: string;
  embeddings: number[][];
}

export interface ModelSession {
  chat: (options: ChatRequest) => Promise<ChatResponse>;
  embed: (options: EmbedRequest) => Promise<EmbedResponse>;
}

export interface EmbeddingsRequest {
  model: string;
  prompt: string;
  keep_alive?: string | number;
  options?: Partial<Options>;
}

export interface EmbedResponse {
  model: string;
  embeddings: number[][];
}

export interface EmbeddingsResponse {
  embedding: number[];
}

export interface ProgressResponse {
  status: string;
  digest: string;
  total: number;
  completed: number;
}

export type PermissionResponse = {
  model: ModelName;
  available: boolean;
}

export type RequestFuncOptions = { model: ModelName };

export type ModelResponse = {
  model: ModelName;
  available: boolean;
}


export interface Permissions {
  models: () => Promise<ModelResponse[]>,
  request: (requestOptions: RequestFuncOptions) => Promise<PermissionResponse>
}
export interface ModelProp {
  connect(connectionOptions: ConnectModelConfig): Promise<ModelSession>;
  info(options: ModelInfoRequest): Promise<ModelInfo>;
}
export interface AI {
  permissions: Permissions;
  model: ModelProp;
}
