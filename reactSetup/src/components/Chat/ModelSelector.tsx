import React from 'react';

export interface Model {
  id: string;
  name: string;
  description: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const models: Model[] = [
  { id: 'gpt-3.5', name: 'GPT-3.5', description: 'Fast and efficient for most tasks' },
  { id: 'gpt-4', name: 'GPT-4', description: 'More powerful for complex tasks' },
  { id: 'claude', name: 'Claude', description: 'Alternative AI model with unique capabilities' },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="block w-32 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
};