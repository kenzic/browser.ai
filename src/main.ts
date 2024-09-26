import { app, BrowserWindow, dialog, ipcMain, IpcMainInvokeEvent } from 'electron';
import { checkModelAvailability, createSession, isConnectedToOllama, listAvailableModels, loadModel, session__chat, session__embed } from './ai-api/device.js';
import { ModelName } from './ai-api/types.js';
import Browser from './browser/index.js';
import { FakeStoreType, getStore, StoreType } from "./lib/store.js";
import { getWindowSize } from "./lib/utils/main.js";
import { setupMenu } from './menu.js';

async function loadDebug() {
  return await import('electron-debug')
}

loadDebug().then((debug) => debug.default({ showDevTools: true }));

// This is a temp solve for
// https://www.perplexity.ai/search/electron-error-error-gl-displa-BdcASse9Qhi7Noslyk1esg
app.disableHardwareAcceleration();

function createBrowserWindow() {
  const { width, height } = getWindowSize();
  const browser = new Browser({
    width,
    height,
    debug: true // will open controlPanel's devtools
  });
  return browser;
}

ipcMain.handle(
  'device:model:enable',
  async (event: IpcMainInvokeEvent, model: ModelName) => {
    const store = await getStore() as FakeStoreType<StoreType>;

    const localModels = store.get('localModels');

    const result = await loadModel(model)
    if (result.status !== 'success') {
      localModels.push({
        name: model,
        installed: true,
      });
      store.set('localModels', localModels)
    }
    return result;
  });

ipcMain.handle(
  'device:model:disable',
  async (event: IpcMainInvokeEvent, model: ModelName) => {
    const store = await getStore() as FakeStoreType<StoreType>;
    const localModels = store.get('localModels');
    const idx = localModels.findIndex((m) => m.name === model);
    // delete model
    if (idx !== -1) {
      localModels.splice(idx, 1);
      store.set('localModels', localModels)
    }
    return {
      status: 'success',
    };
  });

ipcMain.handle(
  'device:connected',
  async (event: IpcMainInvokeEvent) => {
    return isConnectedToOllama()
  });

ipcMain.handle(
  'ai:permissions:models',
  async (event: IpcMainInvokeEvent) => {
    return listAvailableModels()
  });

ipcMain.handle(
  'ai:model:connect',
  async (event: IpcMainInvokeEvent, model: ModelName) => {
    return await createSession({ model });
  });

ipcMain.handle(
  'ai:model:session:chat',
  async (event: IpcMainInvokeEvent, options) => {
    return session__chat(options)
  });

ipcMain.handle(
  'ai:model:session:embed',
  async (event: IpcMainInvokeEvent, options) => {
    return session__embed(options)
  });


app.whenReady().then(async () => {
  // initialize store
  (await getStore());

  const browser = createBrowserWindow();
  setupMenu(browser);

  ipcMain.handle('ai:permissions:request', async (event: IpcMainInvokeEvent, model: ModelName) => {
    const available = await checkModelAvailability(model)

    if (!available) {
      const userRequest = await dialog.showMessageBox({
        type: 'info',
        title: `Site is requesting access to ${model} model`,
        message: `Site is requesting access to ${model} model. To make model available, go to model preferences and enable the model ${model}`,
        buttons: ['Preferences', 'Cancel'],
        cancelId: 1,
        textWidth: 300,
      });
      if (userRequest.response === 0) {
        browser.newTab('about:preferences');
      }
    }
    return available;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createBrowserWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
