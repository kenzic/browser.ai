import { contextBridge } from 'electron';
import { ai } from './ai';

contextBridge.exposeInMainWorld('ai', ai);
