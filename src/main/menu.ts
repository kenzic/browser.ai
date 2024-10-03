import { Menu, app } from 'electron';
import Browser from '../browser/index';

const currentYear = new Date().getFullYear().toString();

export const setupMenu = (browser: Browser) => {
  const isMac = process.platform === 'darwin';

  const tab = () => browser.currentView;
  const tabWebContent = () => tab()?.webContents;

  const credits = `
  This Prototype was developed with 爱 by Chris Mckenzie in NYC
  The goal of this project is to provide a simple playground to explore the possibilities of on device models accessing via a simple API in the window object
  `;

  app.setAboutPanelOptions({
    applicationName: 'Browser.AI',
    applicationVersion: 'Wild Cat',
    version: '1.0.0',
    credits,
    copyright: `©️ ${currentYear} Chris Mckenzie`,
    authors: ['Chris Mckenzie'],
    website: 'https://browser-ai.christophermckenzie.com',
  });

  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      role: 'fileMenu',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          nonNativeMacOSRole: true,
          click: () => browser.newTab(),
        },
        {
          label: 'Close tab',
          accelerator: 'CmdOrCtrl+W',
          nonNativeMacOSRole: true,
          click: () => {
            tabWebContent()?.send('close-tab', tab()?.id);
            // console.log('close tab', tab()?.id);
          },
        },
      ],
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          nonNativeMacOSRole: true,
          click: () => tabWebContent()?.reload(),
        },
        {
          label: 'Force Reload',
          accelerator: 'Shift+CmdOrCtrl+R',
          nonNativeMacOSRole: true,
          click: () => tabWebContent()?.reloadIgnoringCache(),
        },
        {
          label: 'Toggle Developer Tool',
          accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          nonNativeMacOSRole: true,
          click: () => tabWebContent()?.toggleDevTools(),
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
};
