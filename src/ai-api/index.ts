import { models } from './device/index';
import { connectSession } from './device/session';
import {
  AI,
  ConnectSessionOptions,
  ModelInfo,
  ModelInfoOptions,
  ModelSession,
  RequestFuncOptions,
} from './types';

// eslint-disable-next-line import/prefer-default-export
export const createAPI: AI = {
  permissions: {
    models: async () => {
      if (!models.isConnected()) {
        return [];
      }
      return models.listEnabled();
    },
    request: async (requestOptions: RequestFuncOptions): Promise<boolean> => {
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
    }: ConnectSessionOptions): Promise<ModelSession> => {
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
};
