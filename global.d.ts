import {
  RequestOptions,
  ConnectSessionOptions,
  ModelInfoOptions,
  ModelInfo,
  ModelSession,
} from './src/ai-api/types';

interface AIModel {
  name: string;
  enabled: boolean;
}
interface AIInterface {
  permissions: {
    models: () => Promise<AIModel[]>;
    request: (options: RequestOptions) => Promise<boolean>;
  };
  model: {
    info: (options: ModelInfoOptions) => Promise<ModelInfo>;
    connect: (options: ConnectSessionOptions) => Promise<ModelSession>;
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

declare global {
  interface Window {
    ai: AIInterface;
    browserai: BrowserAI;
  }
}

export {};
