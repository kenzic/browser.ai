import { contextBridge, ipcRenderer } from 'electron';
import { AI, ModelName } from '../ai-api/types';


const ai: AI = {
  permissions: {
    models: async () => {
      return ipcRenderer.invoke('ai:permissions:models')
    },
    request: async (model) => {
      return ipcRenderer.invoke('ai:permissions:request', model)
    },
  },
  model: {
    info: async (options) => {
      return ipcRenderer.invoke('ai:model:info', options)
    },
    connect: async (model) => {
      const session = await ipcRenderer.invoke('ai:model:connect', model);

      return {
        chat: async (messages) => {
          return ipcRenderer.invoke('ai:model:session:chat', {
            model: session.model,
            messages
          })
        },
        embed: async (options) => {
          return ipcRenderer.invoke('ai:model:session:embed', {
            mode: session.model,
            ...options
          })
        }
      }
    },
  }
}

contextBridge.exposeInMainWorld('ai', ai);

contextBridge.exposeInMainWorld('__device_model', {
  enable: async (model: ModelName) => {
    return ipcRenderer.invoke('device:model:enable', model)
  },
  disable: async (model: ModelName) => {
    return ipcRenderer.invoke('device:model:disable', model)
  },
  isConnected: async () => {
    return ipcRenderer.invoke('device:connected')
  }
});
