// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";
import { Switch } from "./components/switch";
// import { isConnectedToOllama, loadModel } from "../ai-api/device";
import availableModelsData from "../../../ollama-models.json";

import "../global.css";

const SpinningEmoji = ({ emoji = "😊" }) => {
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

  console.log("isEnabled", enabled, isEnabled);

  useEffect(() => {
    setEnabled(isEnabled);
  }, [isEnabled]);
  return (
    <TableRow>
      <TableCell className="font-medium">{model.title}</TableCell>
      <TableCell>{loading && <SpinningEmoji />}</TableCell>
      <TableCell className="text-right">
        <Switch
          disabled={loading}
          checked={enabled}
          onCheckedChange={async (boolean) => {
            if (boolean) {
              setLoading(true);
              const response = await window.__device_model.enable(model.title);

              if (response.status === "error") {
                throw new Error(response.error);
              } else if (response.status !== "success") {
                throw new Error("Unexpected response");
              }

              // TODO: add to list of available models
              setLoading(false);
              setEnabled(true);
            } else {
              setLoading(true);
              const response = await window.__device_model.disable(model.title);
              if (response.status === "error") {
                throw new Error(response.error);
              } else if (response.status !== "success") {
                throw new Error("Unexpected response");
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

export const Display = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [availableModels, setAvailableModels] = React.useState(new Set([]));

  useEffect(() => {
    async function checkIsConnectedToOllama() {
      const connected = await window.__device_model.isConnected();
      setIsConnected(connected);
    }

    async function listModels() {
      const models = await window.ai.permissions.models();
      const modelNames = models.map((model) => model.name.split(":")[0]);
      setAvailableModels(new Set(modelNames));
      console.log("models", models);
    }
    listModels();
    const intervalID = setInterval(checkIsConnectedToOllama, 3000);

    return () => clearInterval(intervalID);
  }, []);

  return (
    <div>
      <div>Connected {isConnected ? "yes" : "no"}</div>
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
          {availableModelsData.map((model: { title: string }) => {
            return (
              <ModelRow
                key={model.title}
                model={model}
                isEnabled={availableModels.has(model.title)}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
