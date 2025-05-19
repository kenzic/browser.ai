import availableModelsData from '../../../ollama-models.json';

export function getModelMetaData(model: string): {
  name: string;
  link: string;
  tags: string[];
} | null {
  const modelData = availableModelsData.find((m) => m.title === model);
  if (!modelData) {
    return null;
  }

  return {
    name: modelData.title,
    link: modelData.link,
    tags: modelData.tags ?? [],
  };
}
