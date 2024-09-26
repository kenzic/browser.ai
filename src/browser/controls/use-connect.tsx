import { ipcRenderer, IpcRendererEvent } from "electron";
import { useEffect, useState } from "react";
import { TabConfig, TabConfigs, TabsList, TabID } from "../types";

type TabUpdateValue = { confs: TabConfigs; tabs: TabsList };

const noop = () => {};

export default function useConnect(
  options: {
    onTabsUpdate?: (tab: TabUpdateValue) => void;
    onTabActive?: (activeTab: TabConfig) => void;
  } = {}
) {
  const { onTabsUpdate = noop, onTabActive = noop } = options;
  const [tabs, setTabs] = useState<TabConfigs>(() => ({} as TabConfigs));
  const [tabIDs, setTabIDs] = useState<TabsList>([]);
  const [activeID, setActiveID] = useState<number | null>(null);

  const channels = [
    [
      "tabs-update",
      (e: IpcRendererEvent, value: TabUpdateValue) => {
        setTabIDs(value.tabs);
        setTabs(value.confs);
        onTabsUpdate(value);
      },
    ],
    [
      "active-update",
      (e: IpcRendererEvent, value: TabID) => {
        setActiveID(value);
        if (tabs[value as keyof TabConfigs]) {
          onTabActive(tabs[value as keyof TabConfigs]);
        }
      },
    ],
  ] as const;

  useEffect(() => {
    ipcRenderer.send("control-ready");

    channels.forEach(([name, listener]) => ipcRenderer.on(name, listener));

    return () => {
      channels.forEach(([name, listener]) =>
        ipcRenderer.removeListener(name, listener)
      );
    };
  }, []);

  return { tabIDs, tabs, activeID };
}
