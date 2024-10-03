// eslint-disable-next-line max-classes-per-file
import Electron, {
  BrowserWindow,
  BaseWindow,
  WebContentsView,
  WebContents,
  ipcMain,
  app,
} from 'electron';
import EventEmitter from 'events';
import log from 'electron-log';
import path from 'path';
import config from '../lib/config';
import { resolveHtmlPath, getAssetPath } from '../lib/utils/main';

log.transports.file.level = false;
log.transports.console.level = false;

type WebContentsActions = keyof WebContents;
interface Tab {
  url: string;
  href: string;
  title: string;
  favicon: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

type TabID = number;

type Tabs = Record<TabID, Tab>;

type TabPreferences = object;

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BrowserOptions {
  width: number; // browser window's width, default is 1024
  height: number; // browser window's height, default is 800
  controlPanel: string; // control interface path to load
  onNewWindow: (event: Event) => void; // custom webContents `new-window` event handler
  debug: boolean; // toggle debug
}

interface ChannelListener {
  (e: Electron.IpcMainEvent, ...args: any[]): void;
}

interface ChannelEntry {
  name: string;
  listener: ChannelListener;
}

const preloadPath = app.isPackaged
  ? path.join(__dirname, 'preload.js')
  : path.join(__dirname, '../../.erb/dll/preload.js');

class ControlView extends WebContentsView {
  constructor(controlOptions: object) {
    super({
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        // enableRemoteModule: false,
        // Allow loadURL with file path in dev environment
        webSecurity: false,
        ...controlOptions,
      },
    });

    this.webContents.loadURL(resolveHtmlPath('controls.html'));
  }

  destory() {
    this.webContents.removeAllListeners();
    this.webContents.close({ waitForBeforeUnload: false });
  }
}

class WebView extends WebContentsView {
  id: number;

  constructor(options: TabPreferences) {
    super({
      webPreferences: {
        preload: preloadPath,
        // Set sandbox to support window.opener
        // See: https://github.com/electron/electron/issues/1865#issuecomment-249989894
        sandbox: true,
        webSecurity: false,
        ...options,
      },
    });

    this.id = this.webContents.id;
  }
}

interface BrowserConfig {
  startPage: string;
  blankPage: string;
  blankTitle: string;
  debug: boolean;
}

export default class Browser extends EventEmitter {
  options: Partial<BrowserOptions>;
  win: BaseWindow;
  defaultCurrentViewId: TabID | null;
  defaultTabConfigs: Tabs;
  views: Record<TabID, WebView>;
  tabs: TabID[];
  ipc: any;
  controlView: ControlView | null;
  config: BrowserConfig;

  constructor(options: Partial<BrowserOptions>) {
    super();

    this.options = options;
    const { width = 1024, height = 800 } = options;

    this.config = {
      startPage: config.get('startPage'),
      blankPage: config.get('blankPage'),
      blankTitle: config.get('blankTitle'),
      debug: options.debug || config.get('defaultDebug'),
    };

    this.win = new BaseWindow({
      width,
      height,
      minWidth: 400,
      minHeight: 400,
      icon: getAssetPath('icon.png'),
      title: config.get('browserTitle'),
    });

    this.defaultCurrentViewId = null;
    this.defaultTabConfigs = {};
    // Prevent browser views garbage collected
    this.views = {};
    // keep order
    this.tabs = [];
    // ipc channel
    this.ipc = null;

    this.controlView = new ControlView({});

    this.win.on('resized', () => {
      this.setContentBounds();
      this.controlView?.setBounds(this.getControlBounds());
    });

    // TODO: These methods are deprecated. Update
    this.win.contentView.addChildView(this.controlView);
    this.controlView.setBounds(this.getControlBounds());

    const webContentsAct = (actionName: WebContentsActions) => {
      const webContents = this.currentWebContents;
      const action = webContents && webContents[actionName];
      if (typeof action === 'function') {
        if (actionName === 'reload' && webContents?.getURL() === '') return;
        // @ts-ignore
        action.call(webContents);
        log.debug(
          `do webContents action ${actionName.toString()} for ${this.currentViewId}:${
            webContents && webContents.getTitle()
          }`,
        );
      } else {
        log.error('Invalid webContents action ', actionName);
      }
    };

    const channels: [string, ChannelListener][] = Object.entries({
      'control-ready': (e: Electron.IpcMainEvent) => {
        this.ipc = e;
        // TODO: should this only fire once?
        this.newTab(this.config.startPage || '');
        this.emit('control-ready', e);
      },
      'url-change': (e: Electron.IpcMainEvent, url: string) => {
        if (this.currentViewId) this.setTabConfig(this.currentViewId, { url });
      },
      'url-enter': (e: Electron.IpcMainEvent, url: string) => {
        this.loadURL(url);
      },
      act: (e: Electron.IpcMainEvent, actName: WebContentsActions) =>
        webContentsAct(actName),
      'new-tab': (
        e: Electron.IpcMainEvent,
        url: string,
        tabPreferences: TabPreferences,
      ) => {
        log.debug('new-tab with url', url);
        this.newTab(url, undefined, tabPreferences);
      },
      'switch-tab': (e: Electron.IpcMainEvent, id: TabID) => {
        this.switchTab(id);
      },
      'close-tab': (e: Electron.IpcMainEvent, id: TabID) => {
        log.debug('close tab ', { id, currentViewId: this.currentViewId });
        if (id === this.currentViewId) {
          const removeIndex = this.tabs.indexOf(id);
          const nextIndex =
            removeIndex === this.tabs.length - 1 ? 0 : removeIndex + 1;
          this.setCurrentView(this.tabs[nextIndex]);
        }
        this.tabs = this.tabs.filter((v) => v !== id);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...newTabConfigs } = this.tabConfigs;
        this.tabConfigs = newTabConfigs;
        this.destroyView(id);

        if (this.tabs.length === 0) {
          this.newTab();
        }
      },
    });

    channels
      .map(
        ([name, listener]: [string, ChannelListener]): ChannelEntry => ({
          name,
          listener: (e, ...args) => {
            // Support multiple BrowserLikeWindow
            if (this.controlView && e.sender === this.controlView.webContents) {
              log.debug(`Trigger ${name} from ${e.sender.id}`);
              listener(e, ...args);
            }
          },
        }),
      )
      .forEach(({ name, listener }) => {
        if (name === 'control-ready') {
          ipcMain.once(name, listener);
        } else {
          ipcMain.on(name, listener);
        }
      });

    this.win.on('closed', () => {
      // Remember to clear all ipcMain events as ipcMain bind
      // on every new browser instance
      channels.forEach(([name, listener]) =>
        ipcMain.removeListener(name, listener),
      );

      // Prevent WebContentsView memory leak on close
      this.tabs.forEach((id) => this.destroyView(id));
      if (this.controlView) {
        this.controlView.destory();
        this.controlView = null;
        log.debug('Control view destroyed');
      }
      this.emit('closed');
    });

    if (this.config.debug) {
      this.controlView.webContents.openDevTools({ mode: 'detach' });
      log.transports.console.level = 'debug';
    }
  }

  getControlBounds() {
    const contentBounds = this.win.getContentBounds();
    return {
      x: 0,
      y: 0,
      width: contentBounds.width,
      height: 94,
    };
  }

  setContentBounds() {
    const [contentWidth, contentHeight] = this.win.getContentSize();
    const controlBounds = this.getControlBounds();
    if (this.currentView) {
      this.currentView.setBounds({
        x: 0,
        y: controlBounds.y + controlBounds.height,
        width: contentWidth,
        height: contentHeight - controlBounds.height,
      });
    }
  }

  get currentView(): WebView | null {
    return this.currentViewId ? this.views[this.currentViewId] : null;
  }

  get currentWebContents() {
    const { webContents } = this.currentView || {};
    return webContents;
  }

  get currentViewId(): number | null {
    return this.defaultCurrentViewId;
  }

  set currentViewId(id: number) {
    this.defaultCurrentViewId = id;
    this.setContentBounds();
    if (this.ipc) {
      this.ipc.reply('active-update', id);
    }
  }

  get tabConfigs() {
    return this.defaultTabConfigs;
  }

  set tabConfigs(v) {
    this.defaultTabConfigs = v;
    if (this.ipc) {
      this.ipc.reply('tabs-update', {
        confs: v,
        tabs: this.tabs,
      });
    }
  }

  setTabConfig(viewId: number, tabConfig: Partial<Tab>) {
    const tab = this.tabConfigs[viewId];
    const { webContents } = this.views[viewId] || {};

    this.tabConfigs = {
      ...this.tabConfigs,
      [viewId]: {
        ...tab,
        canGoBack: webContents && webContents.canGoBack(),
        canGoForward: webContents && webContents.canGoForward(),
        ...tabConfig,
      },
    };
    return this.tabConfigs;
  }

  loadURL(url: string): void {
    const { currentView } = this;
    if (!url || !currentView) return;
    if (url.includes('about:preferences')) {
      console.log('about:preferences');
      this.loadURL(resolveHtmlPath('settings.html'));

      return;
    }
    const { id, webContents } = currentView;

    // Prevent addEventListeners on same webContents when enter urls in same tab
    const MARKS = '__IS_INITIALIZED__';
    // @ts-ignore
    if (webContents[MARKS]) {
      webContents.loadURL(url);
      return;
    }

    const onNewWindow = (
      e: Electron.IpcMainEvent,
      newUrl: string,
      frameName: string,
      disposition: string,
      winOptions: TabPreferences,
    ) => {
      console.log('onNewWindow', {
        e,
        newUrl,
        frameName,
        disposition,
        winOptions,
      });
      log.debug('on new-window', { disposition, newUrl, frameName });

      if (!new URL(newUrl).host) {
        // Handle newUrl = 'about:blank' in some cases
        log.debug('Invalid url open with default window');
        return;
      }

      e.preventDefault();

      if (disposition === 'new-window') {
        // @ts-ignore
        e.newGuest = new BrowserWindow(winOptions);
      } else if (disposition === 'foreground-tab') {
        this.newTab(newUrl, id);
        // `newGuest` must be setted to prevent freeze trigger tab in case.
        // The window will be destroyed automatically on trigger tab closed.
        // @ts-ignore
        e.newGuest = new BrowserWindow({ ...winOptions, show: false });
      } else {
        this.newTab(newUrl, id);
      }
    };
    // @ts-ignore
    webContents.on('new-window', this.options.onNewWindow || onNewWindow);

    // Keep event in order
    webContents
      .on('did-start-loading', () => {
        log.debug('did-start-loading > set loading');
        this.setTabConfig(id, { isLoading: true });
      })
      .on('did-start-navigation', (e, href, isInPlace, isMainFrame) => {
        if (isMainFrame) {
          log.debug('did-start-navigation > set url address', {
            href,
            isInPlace,
            isMainFrame,
          });
          this.setTabConfig(id, { url: href, href });
          this.emit('url-updated', { view: currentView, href });
        }
      })
      .on('will-redirect', (e, href) => {
        log.debug('will-redirect > update url address', { href });
        this.setTabConfig(id, { url: href, href });
        this.emit('url-updated', { view: currentView, href });
      })
      .on('page-title-updated', (e, title) => {
        log.debug('page-title-updated', title);
        this.setTabConfig(id, { title });
      })
      .on('page-favicon-updated', (e, favicons) => {
        log.debug('page-favicon-updated', favicons);
        this.setTabConfig(id, { favicon: favicons[0] });
      })
      .on('did-stop-loading', () => {
        log.debug('did-stop-loading', { title: webContents.getTitle() });
        this.setTabConfig(id, { isLoading: false });
      })
      .on('dom-ready', () => {
        webContents.focus();
      });

    webContents.loadURL(url);
    // @ts-ignore
    webContents[MARKS] = true;

    this.setContentBounds();

    if (this.config.debug) {
      webContents.openDevTools({ mode: 'detach' });
    }
  }

  setCurrentView(viewId: number) {
    if (!viewId) return;

    if (this.currentView)
      this.win.contentView.removeChildView(this.currentView);
    this.win.contentView.addChildView(this.views[viewId]);
    this.currentViewId = viewId;
  }

  newTab(url?: string, appendTo?: number, tabPreferences: TabPreferences = {}) {
    const view: WebView = new WebView(tabPreferences);

    view.id = view.webContents.id;

    if (appendTo) {
      const prevIndex = this.tabs.indexOf(appendTo);
      this.tabs.splice(prevIndex + 1, 0, view.id);
    } else {
      this.tabs.push(view.id);
    }
    this.views[view.id] = view;

    // Add to manager first
    const lastView = this.currentView;
    this.setCurrentView(view.id);
    // view.setAutoResize({ width: true, height: true });
    this.loadURL(url || this.config.blankPage);
    this.setTabConfig(view.id, {
      title: this.config.blankTitle,
    });
    this.emit('new-tab', view, { openedURL: url, lastView });
    return view;
  }

  switchTab(viewId: number): void {
    log.debug('switch to tab', viewId);
    this.setCurrentView(viewId);
    this.currentView?.webContents.focus();
  }

  destroyView(viewId: TabID) {
    const view: WebView = this.views[viewId];
    if (view) {
      view.webContents.removeAllListeners();
      // this.win.contentView.removeChildView(view);
      delete this.views[viewId];
      (view.webContents as any).destroy();
      view.webContents.close({ waitForBeforeUnload: false });
      log.debug(`${viewId} destroyed`);
    }
  }
}
