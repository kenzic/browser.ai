import { Menu, app } from 'electron';
import Browser from '../browser/index';

const currentYear = new Date().getFullYear().toString();

export const setupMenu = (browser: Browser) => {
  const isMac = process.platform === 'darwin';

  const tab = () => browser.currentView;
  const tabWebContent = () => tab()?.webContents;

  const credits = `
  This prototype was developed with 爱 by Chris Mckenzie in NYC\n\n
  The goal of this project is to provide a prototype to explore the possibilities of on device models accessable via a simple API on the window object
  `;

  app.setAboutPanelOptions({
    applicationName: 'Browser.AI',
    applicationVersion: 'Wild Cat',
    version: '0.1.4',
    credits,
    copyright: `©️ ${currentYear} Chris Mckenzie`,
    authors: ['Chris Mckenzie'],
    website: 'https://browser-ai.christophermckenzie.com',
  });

  const template = [
    ...(isMac
      ? [
          {
            role: 'appMenu',
            label: 'Browser.AI',
            submenu: [
              {
                label: 'About Browser.AI',
                selector: 'orderFrontStandardAboutPanel:',
              },
              { type: 'separator' },
              {
                label: 'Preferences',
                submenu: [
                  {
                    label: 'Model Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => browser.newTab('about:preferences'),
                  },
                ],
              },
              { type: 'separator' },
              { label: 'Services', submenu: [] },
              { type: 'separator' },
              {
                label: 'Hide Browser.AI',
                accelerator: 'Command+H',
                selector: 'hide:',
              },
              {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                selector: 'hideOtherApplications:',
              },
              { label: 'Show All', selector: 'unhideAllApplications:' },
              { type: 'separator' },
              {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => {
                  app.quit();
                },
              },
            ],
          },
        ]
      : []),
    {
      role: 'fileMenu',
      submenu: [
        {
          label: 'Address Bar',
          accelerator: 'Command+L',
          click: () => browser.focusAddressBar(),
        },
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          nonNativeMacOSRole: true,
          click: () => browser.newTab(),
        },
        {
          label: 'Close tab',
          accelerator: 'Command+W',
          nonNativeMacOSRole: true,
          click: () => {
            const tabID = tab()?.id;
            if (tabID) {
              browser.closeTab(tabID);
            }
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
    {
      role: 'helpMenu',
      label: 'Help',
      submenu: [
        {
          label: 'Playground',
          click: () =>
            browser.newTab(
              'https://playground.browser.christophermckenzie.com/',
            ),
        },
        {
          label: 'Documentation',

          click: () =>
            browser.newTab(
              'https://playground.browser.christophermckenzie.com/docs',
            ),
        },
        {
          label: 'Browser AI API',
          click: () =>
            browser.newTab(
              'https://playground.browser.christophermckenzie.com/api',
            ),
        },
        {
          label: 'GitHub Repo',
          click: () => browser.newTab('https://github.com/kenzic/browser.ai'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
};
