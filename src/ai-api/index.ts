import { models } from './device/index';
import { connectSession } from './device/session';
import {
  WindowAIHandler,
  ConnectSessionOptions,
  ModelInfo,
  ModelInfoOptions,
  PrivateModelSessionConnectionResponse,
  RequestOptions,
} from './types';

// eslint-disable-next-line import/prefer-default-export
export const handleAPI: WindowAIHandler = {
  permissions: {
    models: async () => {
      if (!models.isConnected()) {
        return [];
      }
      return models.listEnabled();
    },
    request: async (requestOptions: RequestOptions): Promise<boolean> => {
      if (!models.isConnected()) {
        return false;
      }
      return models.isEnabled(requestOptions.model);
    },
  },
  model: {
    info: async (options: ModelInfoOptions): Promise<ModelInfo> => {
      if (!models.isConnected()) {
        throw new Error('Not connected to Model');
      }
      return models.getInformation(options);
    },
    connect: async ({
      model,
    }: ConnectSessionOptions): Promise<PrivateModelSessionConnectionResponse> => {
      if (!models.isConnected()) {
        throw new Error('Not connected to Model');
      }
      const result = await connectSession({ model });
      // @ts-ignore - Come back to this
      if (!result.active) {
        throw Error('Session could not be created. Confirm Ollama is running.');
      }
      return result;
    },
  },
} as const;
