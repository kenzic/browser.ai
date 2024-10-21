import { WebContents, IpcMainEvent } from 'electron';

export type TabID = number;

export type TabsList = TabID[];

export interface TabConfig extends Object {
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  url: string;
  href: string;
  title: string;
  favicon: string;
}

export type TabConfigs = Record<TabID, TabConfig>;

export interface Tab {
  url: string;
  href: string;
  title: string;
  favicon: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export type Tabs = Record<TabID, Tab>;

export type TabPreferences = object;

export type WebContentsActions = keyof WebContents;

export interface BrowserConfig {
  startPage: string;
  blankPage: string;
  blankTitle: string;
  debug: boolean;
}

export interface BrowserOptions {
  width: number; // browser window's width, default is 1024
  height: number; // browser window's height, default is 800
  controlPanel: string; // control interface path to load
  onNewWindow: (event: Event) => void; // custom webContents `new-window` event handler
  debug: boolean; // toggle debug
}

export interface ChannelListener {
  (e: IpcMainEvent, ...args: any[]): void;
}

export interface ChannelEntry {
  name: string;
  listener: ChannelListener;
}
