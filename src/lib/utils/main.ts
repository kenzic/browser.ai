import { URL } from 'url';
import path from 'path';
import { screen, app } from 'electron';

interface WindowSize {
  width: number;
  height: number;
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

export function getWindowSize(): WindowSize {
  const primaryDisplay = screen.getPrimaryDisplay();
  const width = Math.round(primaryDisplay.workAreaSize.width * 0.8);
  const height = Math.round(primaryDisplay.workAreaSize.height * 0.9);
  return { width, height };
}

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const getAssetPath = (...paths: string[]): string => {
  const fialPath = path.join(RESOURCES_PATH, ...paths);
  return fialPath;
};

const ALIAS_DOMAIN = {
  'about:preferences': resolveHtmlPath('settings.html'),
} as const;

export function isAliasDomain(url: string): url is keyof typeof ALIAS_DOMAIN {
  return url in ALIAS_DOMAIN;
}

export function getAliasURL(url: keyof typeof ALIAS_DOMAIN): string {
  return ALIAS_DOMAIN[url];
}

export function getAliasFromURL(url: string): keyof typeof ALIAS_DOMAIN | null {
  if (!url) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const alias = Object.entries(ALIAS_DOMAIN).find(([_, href]) =>
    url.includes(href),
  ) as [keyof typeof ALIAS_DOMAIN, string];
  return alias ? alias[0] : null;
}
