
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
};

export type TabConfigs = Record<TabID, TabConfig>;


