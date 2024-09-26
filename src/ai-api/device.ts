// @ts-nocheck
import { Ollama, ListResponse } from 'ollama'
import { contextBridge, ipcRenderer } from 'electron';
import { ModelResponse, CreateSessionOptions, ChatResponse, EmbedReponse, ChatOptions, EmbedOptions, EmbedRequest, ChatRequest, ModelSession, PermissionResponse, ModelInfoRequest, ModelInfo, ModelName, LoadModelStatus } from './types.js';
import { getStore } from "../lib/store.js";
import config from '../lib/config.js';

class Device {

}

class OllamaDevice extends Device {

}


const ollama = new Ollama({ host: config.get('ollamaEndpoint') });

type OllamaModelList = Array<{
  title: string;
}>

export async function modelInformation(options: ModelInfoRequest): Promise<ModelInfo> { }

export async function getRunningModels(): Promise<ListResponse> {
  return await ollama.ps();
}

export async function isConnectedToOllama(): Promise<boolean> {
  try {
    await getRunningModels();
    return true;
  } catch (error) {
    return false;
  }
}

export async function loadModel(model: ModelName): Promise<LoadModelStatus> {
  try {
    await ollama.pull({
      model: model,
    });
    return {
      status: 'success'
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    }
  }
}

async function listDeviceModels(): Promise<ListResponse['models']> {
  const response = await ollama.list();
  return response.models;
}

interface ModelWhitelist {
  domain: string;
  models: string[];
}

interface UserPreferences {
  enabledModels: string[];
  deviceHost: string;
  whitelist: ModelWhitelist[];
}

function addToWhitelist(domain, model) {
  const userPreferences = getUserPreferences();
  const whitelist = userPreferences.whitelist;
  const domainIndex = whitelist.findIndex(entry => entry.domain === domain);
  if (domainIndex === -1) {
    whitelist.push({ domain, models: [model] });
  } else {
    whitelist[domainIndex].models.push(model);
  }
}

function removeModelFromWhitelist(domain, model) {
  const userPreferences = getUserPreferences();
  const whitelist = userPreferences.whitelist;
  const domainIndex = whitelist.findIndex(entry => entry.domain === domain);
  if (domainIndex !== -1) {
    whitelist[domainIndex].models = whitelist[domainIndex].models.filter(whitelistedModel => whitelistedModel !== model);
  }
}

function removeDomainFromWhitelist(domain: string) {
  const userPreferences = getUserPreferences();
  const whitelist = userPreferences.whitelist;
  const domainIndex = whitelist.findIndex(entry => entry.domain === domain);
  if (domainIndex !== -1) {
    whitelist.splice(domainIndex, 1);
  }
}

function getUserPreferences(): UserPreferences {
  return {
    enabledModels: ['llama3.1', 'llava'],
    deviceHost: 'http://localhost:11434',
    whitelist: [{ domain: 'www.google.com', models: ['llama3.1'] }]
  }
}

function getMatchingSubset(lista, listb) {
  // Create a Set for fast lookup of titles in lista


  // Filter listb to return only items with matching titles in titleSet
  return listb.filter(item => titleSet.has(item.title));
}

export async function getUserEnabledModels(deviceModels: ListResponse['models']) {
  const userPreferences = getUserPreferences();
  const store = await getStore();
  const localModels = store.get('localModels');
  // TODO: rename installed to enabled, or maybe add that property
  const enabledLocalModels = localModels.filter((model) => model.installed);
  const nameSet = new Set(enabledLocalModels.map(item => item.name));
  return deviceModels.filter((model) => {
    return nameSet.has(model.name.split(':')[0]);
  });
}

export async function checkModelAvailability(modelName: string): Promise<PermissionResponse> {
  const deviceModels = await listDeviceModels();
  const userEnabledModels = await getUserEnabledModels(deviceModels);

  return userEnabledModels.some(enabledModel => enabledModel.name.split(':')[0] === modelName);
}

export async function listAvailableModels(): Promise<ModelResponse[]> {
  const deviceModels = await listDeviceModels();
  const userEnabledModels = await getUserEnabledModels(deviceModels);
  return userEnabledModels.map(model => ({
    model: model.name.split(':')[0],
    available: true
  }));
}

export async function createSession(sessionOptions: CreateSessionOptions): Promise<ModelSession> {
  try {
    const response = await ollama.chat({
      model: sessionOptions.model,
      messages: [{ role: 'user', content: 'status check. Respond with "a" if you understand' }],
    });
    return {
      active: true,
      model: sessionOptions.model,
    }
  } catch (error) {
    console.log('Error creating session:', error);
    return {
      active: false,
      model: null,
    }
  }
}

export const session__chat = ({ messages, model }: ChatRequest): Promise<ChatResponse> => {
  return ollama.chat({
    model,
    messages
  });
}

export const session__embed = ({ model, input }: EmbedRequest): Promise<EmbedReponse> => {
  return ollama.embed({
    model,
    input,
  });
}
