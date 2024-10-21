import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  IpcMainInvokeEvent,
} from 'electron';

import { models } from '../ai-api/device/index';
import { Session } from '../ai-api/device/session';
import { handleAPI } from '../ai-api/index';
import {
  ConnectSessionOptions,
  ModelInfoOptions,
  ModelName,
  RequestOptions,
} from '../ai-api/types';
import Browser from '../browser/index';
import { FakeStoreType, getStore, StoreType } from '../lib/store';
import { getWindowSize } from '../lib/utils/main';
import config from '../lib/config';
import { setupMenu } from './menu';

async function loadDebug() {
  return import('electron-debug');
}

loadDebug()
  .then((debug) => debug.default({ showDevTools: true }))
  // eslint-disable-next-line no-console
  .catch((error) => console.error('Failed to load debug module:', error));

// This is a temp solve for
// https://www.perplexity.ai/search/electron-error-error-gl-displa-BdcASse9Qhi7Noslyk1esg
app.disableHardwareAcceleration();

function createBrowserWindow() {
  const { width, height } = getWindowSize();
  const browser = new Browser({
    width,
    height,
  });
  return browser;
}

ipcMain.handle(
  'device:host:set',
  async (event: IpcMainInvokeEvent, url: string) => {
    const store = (await getStore()) as FakeStoreType<StoreType>;
    store.set('deviceHost', url);
    return true;
  },
);

ipcMain.handle('device:host:get', async () => {
  const store = (await getStore()) as FakeStoreType<StoreType>;
  return store.get('deviceHost') ?? config.get('ollamaEndpoint');
});

ipcMain.handle(
  'device:model:enable',
  async (event: IpcMainInvokeEvent, model: ModelName) => {
    const store = (await getStore()) as FakeStoreType<StoreType>;
    const localModels = store.get('localModels') as StoreType['localModels'];

    const result = await models.load(model);
    if (result.status === 'success') {
      localModels.push({
        model,
        enabled: true,
      });

      store.set('localModels', localModels);
    }
    return result;
  },
);

ipcMain.handle(
  'device:model:disable',
  async (event: IpcMainInvokeEvent, model: ModelName) => {
    const store = (await getStore()) as FakeStoreType<StoreType>;
    const localModels = store.get('localModels') as StoreType['localModels'];
    const idx = localModels.findIndex((m) => m.name === model);
    // delete model
    if (idx !== -1) {
      localModels.splice(idx, 1);
      store.set('localModels', localModels);
    }
    return {
      status: 'success',
    };
  },
);

ipcMain.handle('device:connected', async () => {
  return models.isConnected();
});

ipcMain.handle('ai:permissions:models', async () => {
  return handleAPI.permissions.models();
});

// const sessions = {};

ipcMain.handle(
  'ai:model:info',
  async (event: IpcMainInvokeEvent, options: ModelInfoOptions) => {
    // sessions[id] = Session.create(data);
    // and then this could be destroyed when the window is closed, or session is destroyed
    return handleAPI.model.info({ model: options.model });
  },
);

ipcMain.handle(
  'ai:model:connect',
  async (event: IpcMainInvokeEvent, options: ConnectSessionOptions) => {
    // sessions[id] = Session.create(data);
    // and then this could be destroyed when the window is closed, or session is destroyed
    return handleAPI.model.connect({ model: options.model });
  },
);

ipcMain.handle(
  'ai:model:session:chat',
  async (event: IpcMainInvokeEvent, options) => {
    const session = Session.create();
    return session.chat(options);
  },
);

ipcMain.handle(
  'ai:model:session:embed',
  async (event: IpcMainInvokeEvent, options) => {
    const session = Session.create();
    return session.embed(options);
  },
);

app
  .whenReady()
  .then(async () => {
    // initialize store
    await getStore();

    const browser = createBrowserWindow();
    setupMenu(browser);

    ipcMain.handle(
      'ai:permissions:request',
      async (event: IpcMainInvokeEvent, requestOptions: RequestOptions) => {
        const enabled = await handleAPI.permissions.request(requestOptions);

        if (!enabled && requestOptions?.silent !== true) {
          const userRequest = await dialog.showMessageBox({
            type: 'info',
            title: `Site is requesting access to ${requestOptions.model} model`,
            message: `Site is requesting access to ${requestOptions.model} model. To make model available, go to model preferences and enable the model ${requestOptions.model}`,
            buttons: ['Preferences', 'Cancel'],
            cancelId: 1,
            textWidth: 300,
          });
          if (userRequest.response === 0) {
            browser.newTab('about:preferences');
          }
        }
        return enabled;
      },
    );

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createBrowserWindow();
      }
    });

    return true;
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log('app error', error);
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
