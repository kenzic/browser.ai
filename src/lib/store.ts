export interface StoreType {
  localModels: {
    name: string;
    installed: boolean;
  }[];
}

export type FakeStoreType<T> = { get: (key: keyof T) => T[typeof key], set: (key: string, value: any) => void };

let _store: null = null;

export async function getStore(): Promise<FakeStoreType<StoreType> | null> {
  const schema = {
    localModels: {
      type: "array",
      default: [],
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          installed: {
            type: "boolean",
            default: false,
          },
        },
      },
    },
  };
  if (!_store) {
    const ElectronStore = (await import('electron-store')).default
    // @ts-ignore
    _store = new ElectronStore<StoreType>({ schema });
  }

  return _store;
}
