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
  width: number;
  height: number;
  controlPanel: string;
  onNewWindow: (event: Event) => void;
  debug: boolean;
}

export interface ChannelListener {
  (e: IpcMainEvent, ...args: any[]): void;
}

export interface ChannelEntry {
  name: string;
  listener: ChannelListener;
}
