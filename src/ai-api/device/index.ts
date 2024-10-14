import { ListResponse, Ollama } from 'ollama';
import config from '../../lib/config';
import { getStore, StoreInstance } from '../../lib/store';
import { cleanName } from '../../lib/utils';
import { formatZodError } from '../../lib/utils/format-zod-error';
import {
  LoadModelStatus,
  ModelInfo,
  ModelInfoOptions,
  ModelName,
  ModelResponse,
} from '../types';
import { modelInfoOptionsSchema, modelNameSchema } from '../validate';

const ollama = new Ollama({ host: config.get('ollamaEndpoint') });

function renameCleanModelData(model: ModelInfo): ModelInfo {
  return {
    name: cleanName(model.name),
    model: model.model,
  };
}

interface ModelWhitelist {
  domain: string;
  models: string[];
}

interface ModelPreferences {
  name: string;
  installed: boolean;
}

interface UserPreferences {
  enabledModels: ModelPreferences[];
  deviceHost: string;
  whitelist: ModelWhitelist[];
}

async function getUserPreferences(): Promise<UserPreferences> {
  const store = (await getStore()) as StoreInstance;
  const localModels = store.get('localModels') as ModelPreferences[];
  const deviceHost = (store.get('deviceHost') ||
    config.get('ollamaEndpoint')) as string;
  return {
    enabledModels: localModels?.filter((model) => model.installed) || [],
    deviceHost,
    whitelist: [{ domain: 'www.google.com', models: ['llama3.1'] }],
  };
}

/**
 * Retrieves the models enabled by the user from the provided device models.
 *
 * @param deviceModels - An array of models available on the device.
 * @returns A filtered array of models that are enabled by the user based on their preferences.
 */
export async function getUserEnabledModels(
  deviceModels: ListResponse['models'],
) {
  const userPreferences = await getUserPreferences();
  const nameSet = new Set(
    userPreferences.enabledModels.map((item) => item.name),
  );
  return deviceModels.filter((model) => {
    return nameSet.has(cleanName(model.name));
  });
}

export const models = {
  _host: config.get('ollamaEndpoint'),
  getClient: () => {
    return ollama;
  },
  async getInformation(options: ModelInfoOptions): Promise<ModelInfo> {
    const result = modelInfoOptionsSchema.safeParse(options);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const response = await this.getClient().show(options);
    if (response.error) {
      throw new Error(response.error);
    }

    return {
      model: options.model,
      license: response.license,
      details: {
        ...response.details,
      },
    };
  },
  async load(model: ModelName): Promise<LoadModelStatus> {
    const result = modelNameSchema.safeParse(model);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    try {
      await this.getClient().pull({
        model,
      });
      return {
        status: 'success',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  },
  async listRunning(): Promise<ListResponse> {
    return this.getClient().ps();
  },
  async listAvailable(): Promise<ModelResponse[]> {
    const response = await this.getClient().list();
    return response.models.map(renameCleanModelData);
  },
  async listEnabled(): Promise<ModelResponse[]> {
    const deviceModels = await this.listAvailable();
    const userEnabledModels = await getUserEnabledModels(deviceModels);
    return userEnabledModels.map((model) => ({
      model: cleanName(model.name),
      enabled: true,
    }));
  },
  async isConnected(): Promise<boolean> {
    try {
      await this.getClient().ps();
      return true;
    } catch (error) {
      return false;
    }
  },
  async isAvailable(model: ModelName): Promise<boolean> {
    const result = modelNameSchema.safeParse(model);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }
    // TODO: implement
    return true;
  },
  async isEnabled(model: ModelName): Promise<boolean> {
    const result = modelNameSchema.safeParse(model);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }
    const deviceModels = await this.listAvailable();
    const userEnabledModels = await getUserEnabledModels(deviceModels);

    return userEnabledModels.some(
      (enabledModel) => cleanName(enabledModel.name) === model,
    );
  },
  async isRunning(model: ModelName): Promise<boolean> {
    const result = modelNameSchema.safeParse(model);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }
    // return this.listRunning().then((response) => {
    //   return response.models.some((runningModel) => runningModel.name === model);
    // });
    // TODO: implement
    return true;
  },
};
