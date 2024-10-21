import {
  ListResponse,
  ModelResponse as OllamaModelResponse,
  Ollama,
} from 'ollama';
import config from '../../lib/config';
import { getStore, StoreInstance } from '../../lib/store';
import { cleanName } from '../../lib/utils';
import { formatZodError } from '../../lib/utils/format-zod-error';
import {
  LoadModelStatus,
  ModelInfo,
  ModelInfoOptions,
  ModelName,
  EnabledModelResponse,
} from '../types';
import { modelInfoOptionsSchema, modelNameSchema } from '../validate';

const ollama = new Ollama({ host: config.get('ollamaEndpoint') });

// interface ModelWhitelist {
//   domain: string;
//   models: string[];
// }

interface ModelPreferences {
  model: string;
  enabled: boolean;
}

interface UserPreferences {
  enabledModels: ModelPreferences[];
  deviceHost: string;
  // whitelist: ModelWhitelist[]; // TODO: enable whitelist
}

async function getUserPreferences(): Promise<UserPreferences> {
  const store = (await getStore()) as StoreInstance;
  const localModels = store.get('localModels') as unknown as ModelPreferences[];
  const deviceHost = (store.get('deviceHost') ||
    config.get('ollamaEndpoint')) as string;

  return {
    enabledModels: localModels.filter((model) => model.enabled) || [],
    deviceHost,
    // whitelist: [], // TODO: enable whitelist
  };
}

/**
 * Retrieves the models enabled by the user from the provided device models.
 *
 * @param deviceModels - An array of models available on the device.
 * @returns A filtered array of models that are enabled by the user based on their preferences.
 */
export async function getUserEnabledModels(
  deviceModels: EnabledModelResponse[],
) {
  const userPreferences = await getUserPreferences();
  const nameSet = new Set(
    userPreferences.enabledModels.map((item) => item.model),
  );
  return deviceModels.filter((model) => {
    return nameSet.has(model.model);
  });
}

/**
 * Device API functions.
 *
 * This is intentionally left incomplete.
 * Ultimately, the concept of a "device" should have it's own abstraction layer.
 * This would allow for the implementation of different devices, such as a local device or a remote device.
 * For the sake of this prototype, I kept it simple because it didn't want to overcomplicate the codebase, and be too oppinionated about how
 * the device should be implemented before I have a clear understanding of the total scope of the functionality
 */
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

    try {
      const response = await this.getClient().show(options);

      return {
        model: options.model,
        license: response.license,
        details: {
          ...response.details,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
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
        message: (error as Error).message,
      };
    }
  },
  async listRunning(): Promise<ListResponse> {
    return this.getClient().ps();
  },
  async listAvailable(): Promise<EnabledModelResponse[]> {
    const response = await this.getClient().list();
    return response.models.map(
      (model: OllamaModelResponse): EnabledModelResponse => {
        return {
          model: cleanName(model.name),
          enabled: true,
        };
      },
    );
  },
  async listEnabled(): Promise<EnabledModelResponse[]> {
    const deviceModels = await this.listAvailable();

    const userEnabledModels = await getUserEnabledModels(deviceModels);

    return userEnabledModels.map((model) => ({
      model: model.model,
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
      (enabledModel) => enabledModel.model === model,
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
