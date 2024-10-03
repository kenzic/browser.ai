// @ts-nocheck
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  IpcMainInvokeEvent,
} from 'electron';

import { models } from '../ai-api/device/index';
import { Session } from '../ai-api/device/session';
import { createAPI } from '../ai-api/index';
import {
  RequestFuncOptions,
  ModelName,
  ConnectSessionOptions,
  ModelInfoOptions,
} from '../ai-api/types';
import Browser from '../browser/index';
import { FakeStoreType, getStore, StoreType } from '../lib/store';
import { getWindowSize } from '../lib/utils/main';
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
    debug: true, // will open controlPanel's devtools
  });
  return browser;
}

ipcMain.handle(
  'device:model:enable',
  async (event: IpcMainInvokeEvent, model: ModelName) => {
    const store = (await getStore()) as FakeStoreType<StoreType>;
    const localModels = store.get('localModels');

    const result = await models.load(model);
    if (result.status === 'success') {
      localModels.push({
        name: model,
        installed: true,
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
    const localModels = store.get('localModels');
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

ipcMain.handle('device:connected', async (event: IpcMainInvokeEvent) => {
  return models.isConnected();
});

ipcMain.handle('ai:permissions:models', async (event: IpcMainInvokeEvent) => {
  return createAPI.permissions.models();
});

// const sessions = {};

ipcMain.handle(
  'ai:model:info',
  async (event: IpcMainInvokeEvent, options: ModelInfoOptions) => {
    // sessions[id] = Session.create(data);
    // and then this could be destroyed when the window is closed, or session is destroyed
    return createAPI.model.info({ model: options.model });
  },
);

ipcMain.handle(
  'ai:model:connect',
  async (event: IpcMainInvokeEvent, options: ConnectSessionOptions) => {
    // sessions[id] = Session.create(data);
    // and then this could be destroyed when the window is closed, or session is destroyed
    return createAPI.model.connect({ model: options.model });
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
      async (event: IpcMainInvokeEvent, requestOptions: RequestFuncOptions) => {
        const available = await createAPI.permissions.request(requestOptions);

        if (!available) {
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
        return available;
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
    console.log('app error', error);
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
