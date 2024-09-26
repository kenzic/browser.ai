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
    request: (modelName: string) => Promise<boolean>;
  };
  model: {
    connect: (modelName: string) => Promise<AISession>;
  };
}

declare global {
  interface Window {
    ai: AIInterface;
  }
}
