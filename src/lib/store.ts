export interface StoreType {
  localModels: Array<{
    model: string;
    enabled: boolean;
  }>;
  deviceHost?: string;
}

export type FakeStoreType<T> = {
  get: (key: keyof T) => T[typeof key];
  set: (key: string, value: any) => void;
};

export type StoreInstance = FakeStoreType<StoreType>;

// eslint-disable-next-line no-underscore-dangle
let _store: null = null;

export async function getStore(): Promise<FakeStoreType<StoreType> | null> {
  const schema = {
    deviceHost: {
      type: 'string',
      default: '',
    },
    localModels: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          enabled: {
            type: 'boolean',
            default: false,
          },
        },
      },
    },
  };
  if (!_store) {
    const ElectronStore = (await import('electron-store')).default;
    // @ts-ignore
    _store = new ElectronStore<StoreType>({ schema });
  }

  return _store;
}
