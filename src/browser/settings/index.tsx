import React, { useEffect, useState } from 'react';
import availableModelsData from '../../../ollama-models.json';
import { Skeleton } from './components/skeleton';
import { Switch } from './components/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/table';

import '../global.css';

type ModelConfigureation = {
  title: string;
  link: string;
  tags: string[];
};

type ModelsConfigurationFile = Array<ModelConfigureation>;

const SpinningEmoji: React.FC<{ emoji?: string }> = ({ emoji = '😊' }) => {
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
  isConnected?: boolean;
}) => {
  // const [hostUrl, setHostUrl] = useState('');

  // useEffect(() => {
  //   async function getHost() {
  //     const host = await window.browserai.device.getHost();
  //     setHostUrl(host);
  //   }
  //   getHost();
  // }, [setHostUrl]);

  return (
    <div className="flex items-center justify-between space-x-2 p-4 bg-gray-100 rounded-lg shadow-md mb-6">
      <div>
        <span className="inline text-lg font-semibold">
          Ollama connection status:{' '}
        </span>
        <div
          className={`inline text-lg font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}
        >
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>
      <div>
        {/* <input
          type="url"
          className="border-2 p-2 rounded-md"
          value={hostUrl}
          onChange={(e) => {
            const { value } = e.target;
            setHostUrl(value);
          }}
          onBlur={() => {
            window.browserai.device.setHost(hostUrl);
          }}
        /> */}
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

function getModelFamily(model: ModelConfigureation) {
  return model.tags.find((tag) => tag.includes('family:')) ?? 'unknown';
}

export const Display = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState(new Set<string>([]));

  const groupedModels: [string, Array<ModelConfigureation>][] = Object.entries(
    Object.groupBy(
      availableModelsData as ModelsConfigurationFile,
      (model: ModelConfigureation) => {
        return getModelFamily(model);
      },
    ),
  );

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
            groupedModels.map(([family, models]) => {
              const groupDisplay = [
                <TableRow
                  key={family}
                  className="border-0 hover:bg-transparent"
                >
                  <TableCell
                    colSpan={3}
                    className="font-bold text-lg bg-gradient-to-tl to-teal-500 from-purple-400  inline-block text-transparent bg-clip-text p-1 "
                  >
                    {family.replace('family:', '')}
                  </TableCell>
                </TableRow>,
              ];
              models
                .sort((a, b) => b.title.localeCompare(a.title))
                .forEach((model) => {
                  groupDisplay.push(
                    <ModelRow
                      key={model.title}
                      model={model}
                      isEnabled={availableModels.has(model.title)}
                    />,
                  );
                });
              return groupDisplay;
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
