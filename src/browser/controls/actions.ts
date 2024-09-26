import { ipcRenderer } from 'electron';
import { TabID } from '../types';

export const sendEnterURL = (url: string) => ipcRenderer.send('url-enter', url);

export const sendChangeURL = (url: string) => ipcRenderer.send('url-change', url);

export const sendAct = (actName: string) => {
  ipcRenderer.send('act', actName);
};

export const sendGoBack = () => sendAct('goBack');

export const sendGoForward = () => sendAct('goForward');

export const sendReload = () => sendAct('reload');

export const sendStop = () => sendAct('stop');

export const sendCloseTab = (id: TabID) => ipcRenderer.send('close-tab', id);

export const sendNewTab = (url?: string, references?: object) => ipcRenderer.send('new-tab', url, references);

export const sendSwitchTab = (id: TabID) => ipcRenderer.send('switch-tab', id);
