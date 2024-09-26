
const CONFIG = {
  ollamaEndpoint: 'http://localhost:11434',
  startPage: 'http://localhost:3000',
  blankPage: 'about:blank',
  blankTitle: 'New Tab',
  defaultDebug: false,
  appTitle: 'Browser.AI',
  browserTitle: "Browser.AI Prototype",
} as const;

export default {
  values: CONFIG,
  get: <K extends keyof typeof CONFIG>(key: K): typeof CONFIG[K] => {
    return CONFIG[key];
  }
}