import React, { useState } from 'react';
import { ModelSelector } from './ModelSelector';

interface ChatInputProps {
  onSendMessage: (message: string, modelId: string) => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, selectedModel, onModelChange }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, selectedModel);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      <div className="mb-3">
        <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
      </div>
      <div className="input-container flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 outline-none bg-transparent"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-1 rounded-full hover:bg-primary/90 transition-colors"
        >
          Send
        </button>
      </div>
    </form>
  );
};
