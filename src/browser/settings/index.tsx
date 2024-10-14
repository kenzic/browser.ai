// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/table';
import { Skeleton } from './components/skeleton';
import { Switch } from './components/switch';
// import { isConnectedToOllama, loadModel } from "../ai-api/device";
import availableModelsData from '../../../ollama-models.json';

import '../global.css';

const SpinningEmoji = ({ emoji = '😊' }: { emoji: string }) => {
  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="text-2xl animate-spin">{emoji}</div>
    </div>
  );
};

type ModelRowProps = {
  model: {
    title: string;
  };
  isEnabled: boolean;
};

const ModelRow: React.FC<ModelRowProps> = ({ model, isEnabled }) => {
  const [enabled, setEnabled] = useState(isEnabled);
  const [loading, setLoading] = useState(false);
  const getStatusText = (showEnabled: boolean) => {
    if (showEnabled) {
      return 'Enabled';
    }
    return 'Available for Download';
  };

  useEffect(() => {
    setEnabled(isEnabled);
  }, [isEnabled]);
  return (
    <TableRow>
      <TableCell className="font-bold">{model.title}</TableCell>
      <TableCell>
        {loading ? <SpinningEmoji /> : getStatusText(enabled)}
      </TableCell>
      <TableCell className="text-right">
        <Switch
          disabled={loading}
          checked={enabled}
          onCheckedChange={async (boolean) => {
            if (boolean) {
              setLoading(true);
              const response = await window.browserai.device.enable(
                model.title,
              );

              if (response.status === 'error') {
                throw new Error(response.error);
              } else if (response.status !== 'success') {
                throw new Error('Unexpected response');
              }

              // TODO: add to list of available models
              setLoading(false);
              setEnabled(true);
            } else {
              setLoading(true);
              const response = await window.browserai.device.disable(
                model.title,
              );
              if (response.status === 'error') {
                throw new Error(response.error);
              } else if (response.status !== 'success') {
                throw new Error('Unexpected response');
              }
              setLoading(false);
              setEnabled(false);
            }
          }}
        />
      </TableCell>
    </TableRow>
  );
};

const ConnectionStatus = ({
  isConnected = false,
}: {
  isConnected: boolean;
}) => {
  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-100 rounded-lg shadow-md mb-6">
      <span className="text-lg font-semibold">Ollama connection Status:</span>
      <div
        className={`text-lg font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}
      >
        {isConnected ? 'Connected' : 'Not Connected'}
      </div>
    </div>
  );
};

const TableSkeleton = () => {
  return (
    <TableRow>
      <TableCell className="font-bold">
        <Skeleton className="h-4 w-[50px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[150px]" />
      </TableCell>
      <TableCell className="text-right justify-end flex">
        <Skeleton className="h-6 w-11 rounded-full" />
      </TableCell>
    </TableRow>
  );
};

export const Display = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [availableModels, setAvailableModels] = React.useState(new Set([]));

  useEffect(() => {
    async function checkIsConnectedToOllama() {
      const connected = await window.browserai.device.isConnected();
      setIsConnected(connected);
    }

    async function listModels() {
      const modelList = await window.ai.permissions.models();
      const modelNames = modelList.map((item) => item.model.split(':')[0]);
      setAvailableModels(new Set(modelNames));
    }
    listModels();
    checkIsConnectedToOllama();
    const intervalID = setInterval(checkIsConnectedToOllama, 3000);

    return () => clearInterval(intervalID);
  }, []);

  return (
    <div className="max-w-3xl m-auto pt-4">
      <h1 className="text-3xl font-bold mb-4">
        <span className="bg-gradient-to-tl from-teal-500 to-purple-400  inline-block text-transparent bg-clip-text">
          Browser.AI Settings
        </span>
      </h1>
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
        <p className="text-sm">
          Browser.AI leverages Ollama to support on-device models. Ollama must
          be running on your machine for AI API to function properly. You can
          download Ollama from{' '}
          <a
            className="text-blue-600 hover:text-blue-800 underline"
            href="https://ollama.com/download"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ollama.com/download
          </a>
          .
        </p>
      </div>
      <ConnectionStatus isConnected={isConnected} />
      <div className=" text-gray-700 mb-4 mt-12">
        <h1 className="text-xl font-bold mb-2">Model Settings</h1>
        <p className="text-sm">
          You can enable or disable each model using the switch on the right.
          Once enabled, sites using the AI API can preform tasks using the model
          via the AI API.
        </p>
      </div>
      <Table>
        <TableCaption>Models Available to Install</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Enable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isConnected &&
            availableModelsData.map((model: { title: string }) => {
              return (
                <ModelRow
                  key={model.title}
                  model={model}
                  isEnabled={availableModels.has(model.title)}
                />
              );
            })}
          {!isConnected &&
            Array.from({ length: 6 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <TableSkeleton key={index} />
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
