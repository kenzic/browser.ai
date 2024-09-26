import { AI, ConnectModelConfig, ModelSession, ModelName, RequestFuncOptions, PermissionResponse, ModelInfoRequest, ModelInfo } from './types.js';
import { listAvailableModels, createSession, checkModelAvailability, modelInformation } from './device.js';

export const createAPI: AI = {
  permissions: {
    models: async () => {
      return listAvailableModels();
    },
    request: async (requestOptions: RequestFuncOptions): Promise<PermissionResponse> => {
      return checkModelAvailability(requestOptions.model);
    },
  },
  model: {
    info: async (options: ModelInfoRequest): Promise<ModelInfo> => {
      return modelInformation(options)
    },
    connect: async (config: ConnectModelConfig): Promise<ModelSession> => {
      return createSession({
        model: config.model,
      });
    },
  }
};

