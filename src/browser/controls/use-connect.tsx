import { type IpcRendererEvent } from 'electron';
import { useEffect, useState } from 'react';
import { TabConfig, TabConfigs, TabsList, TabID } from '../types';

type TabUpdateValue = { confs: TabConfigs; tabs: TabsList };

const noop = () => {};

export default function useConnect(
  options: {
    onTabsUpdate?: (tab: TabUpdateValue) => void;
    onTabActive?: (activeTab: TabConfig) => void;
  } = {},
) {
  const { onTabsUpdate = noop, onTabActive = noop } = options;
  const [tabs, setTabs] = useState<TabConfigs>(() => ({}) as TabConfigs);
  const [tabIDs, setTabIDs] = useState<TabsList>([]);
  const [activeID, setActiveID] = useState<number | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    window.browserai.controls.controlReady();
    const destoryTabsUpdate = window.browserai.controls.onTabsUpdate(
      (e: IpcRendererEvent, value: TabUpdateValue) => {
        setTabIDs(value.tabs);
        setTabs(value.confs);
        onTabsUpdate(value);
      },
    );

    const destroyActiveUpdate = window.browserai.controls.onActiveUpdate(
      (e: IpcRendererEvent, value: TabID) => {
        setActiveID(value);
        if (tabs[value as keyof TabConfigs]) {
          onTabActive(tabs[value as keyof TabConfigs]);
        }
      },
    );

    return () => {
      destoryTabsUpdate();
      destroyActiveUpdate();
    };
  }, [tabs, onTabsUpdate, onTabActive]);

  return { tabIDs, tabs, activeID };
}
