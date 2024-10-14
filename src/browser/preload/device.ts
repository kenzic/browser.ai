import { ipcRenderer } from 'electron';
import { ModelName } from '../../ai-api/types';

export const device = {
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
