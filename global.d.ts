import { RequestFuncOptions, ConnectSessionOptions } from './src/ai-api/types';

interface AIModel {
  name: string;
  installed: boolean;
}

interface AISession {
  chat: () => Promise<unknown>; // Replace 'unknown' with the actual return type
  embed: () => Promise<unknown>; // Replace 'unknown' with the actual return type
}

interface AIInterface {
  permissions: {
    models: () => Promise<AIModel[]>;
    request: (options: RequestFuncOptions) => Promise<boolean>;
  };
  model: {
    connect: (options: ConnectSessionOptions) => Promise<AISession>;
  };
}

interface Actions {
  sendEnterURL: (url: string) => void;
  sendChangeURL: (url: string) => void;
  sendAct: (actName: string) => void;
  sendCloseTab: (id: string | number) => void;
  sendNewTab: (url?: string, references?: object) => void;
  sendSwitchTab: (id: string | number) => void;
}

interface Controls {
  controlReady: () => void;
  onActiveUpdate: (callback: (...args: any[]) => void) => () => void;
  onTabsUpdate: (callback: (...args: any[]) => void) => () => void;
}

interface Device {
  enable: (model: string) => Promise<any>;
  disable: (model: string) => Promise<any>;
  isConnected: () => Promise<boolean>;
}

interface BrowserAI {
  device: Device;
  controls: Controls & {
    actions: Actions;
  };
}

export {};

declare global {
  interface Window {
    ai: AIInterface;
    browserai: BrowserAI;
  }
}
