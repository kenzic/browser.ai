import { ipcRenderer } from 'electron';
import { AI } from '../../ai-api/types';
/**
 * @summary
 *
 * *You can mostly ignore this file*
 * This code is required by Electron's contextBridge for security purposes.
 * It prevents the renderer process from directly accessing the main process.
 * The code exposes `window.ai` and forwards calls to the main process, which then interacts with the AI API.
 *
 * For more details, you can read about context isolation here: https://www.electronjs.org/docs/tutorial/context-isolation
 */
export const ai: AI = {
  permissions: {
    models: async () => {
      return ipcRenderer.invoke('ai:permissions:models');
    },
    request: async (model) => {
      return ipcRenderer.invoke('ai:permissions:request', model);
    },
  },
  model: {
    info: async (options) => {
      return ipcRenderer.invoke('ai:model:info', options);
    },
    connect: async (model) => {
      const session = await ipcRenderer.invoke('ai:model:connect', model);
      if (!session.active || !session.model) {
        throw new Error(`Failed to connect to model ${model}`);
      }

      return {
        chat: async (options) => {
          return ipcRenderer.invoke('ai:model:session:chat', {
            ...options,
            model: session.model,
          });
        },
        embed: async (options) => {
          return ipcRenderer.invoke('ai:model:session:embed', {
            ...options,
            model: session.model,
          });
        },
      };
    },
  },
};
