import { TabID } from '../types';

export const sendEnterURL = (url: string) =>
  window.browserai.controls.actions.sendEnterURL(url);

export const sendChangeURL = (url: string) =>
  window.browserai.controls.actions.sendChangeURL(url);

export const sendAct = (actName: string) =>
  window.browserai.controls.actions.sendAct(actName);

export const sendGoBack = () => sendAct('goBack');

export const sendGoForward = () => sendAct('goForward');

export const sendReload = () => sendAct('reload');

export const sendStop = () => sendAct('stop');

export const sendCloseTab = (id: TabID) =>
  window.browserai.controls.actions.sendCloseTab(id);

export const sendNewTab = (url?: string, references?: object) =>
  window.browserai.controls.actions.sendNewTab(url, references);

export const sendSwitchTab = (id: TabID) =>
  window.browserai.controls.actions.sendSwitchTab(id);
