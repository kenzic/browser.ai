import { ipcRenderer } from 'electron';
import { TabID } from '../types';

export const actions = {
  sendEnterURL: (url: string) => ipcRenderer.send('url-enter', url),

  sendChangeURL: (url: string) => ipcRenderer.send('url-change', url),

  sendAct: (actName: string) => ipcRenderer.send('act', actName),

  sendCloseTab: (id: TabID) => ipcRenderer.send('close-tab', id),

  sendNewTab: (url?: string, references?: object) =>
    ipcRenderer.send('new-tab', url, references),

  sendSwitchTab: (id: TabID) => ipcRenderer.send('switch-tab', id),
};

export const controls = {
  controlReady: () => ipcRenderer.send('control-ready'),
  onActiveUpdate: (callback: any) => {
    // Do I need to remove the listener?
    ipcRenderer.on('active-update', callback);
    return () => ipcRenderer.removeListener('active-update', callback);
  },
  onTabsUpdate: (callback: any) => {
    ipcRenderer.on('tabs-update', callback);
    return () => ipcRenderer.removeListener('tabs-update', callback);
  },
  onFocusAddressBar: (callback: any) => {
    ipcRenderer.on('focus-address-bar', callback);
    return () => ipcRenderer.removeListener('focus-address-bar', callback);
  },
};
