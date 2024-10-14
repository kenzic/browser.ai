import { contextBridge } from 'electron';

import { device } from './device';
import { controls, actions } from './controls';
import { ai } from './ai';

const browserai = {
  device,
  controls: {
    ...controls,
    actions,
  },
};

contextBridge.exposeInMainWorld('ai', ai);
contextBridge.exposeInMainWorld('browserai', browserai);