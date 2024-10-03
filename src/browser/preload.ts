import { contextBridge, ipcRenderer } from 'electron';
import { AI, ModelName } from '../ai-api/types';
import { TabID } from './types';

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
const ai: AI = {
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

const actions = {
  sendEnterURL: (url: string) => ipcRenderer.send('url-enter', url),

  sendChangeURL: (url: string) => ipcRenderer.send('url-change', url),

  sendAct: (actName: string) => ipcRenderer.send('act', actName),

  sendCloseTab: (id: TabID) => ipcRenderer.send('close-tab', id),

  sendNewTab: (url?: string, references?: object) =>
    ipcRenderer.send('new-tab', url, references),

  sendSwitchTab: (id: TabID) => ipcRenderer.send('switch-tab', id),
};

const controls = {
  controlReady: () => ipcRenderer.send('control-ready'),
  onActiveUpdate: (callback: any) => {
    // Do I need to remove the listener?
    ipcRenderer.on('active-update', callback);
    return () => ipcRenderer.removeListener('active-update', callback);
  },
  onTabsUpdate: (callback: any) => {
    ipcRenderer.on('tabs-update', callback);
    return () => ipcRenderer.removeListener('tabs-update', callback);
  },
};

const device = {
  enable: async (model: ModelName) => {
    return ipcRenderer.invoke('device:model:enable', model);
  },
  disable: async (model: ModelName) => {
    return ipcRenderer.invoke('device:model:disable', model);
  },
  isConnected: async () => {
    return ipcRenderer.invoke('device:connected');
  },
};

const browserai = {
  device,
  controls: {
    ...controls,
    actions,
  },
};

contextBridge.exposeInMainWorld('ai', ai);

contextBridge.exposeInMainWorld('browserai', browserai);
