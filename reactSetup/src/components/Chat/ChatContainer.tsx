import React from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { Message } from '../../types/chat';

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    sender: 'ai',
    timestamp: new Date(),
  },
  {
    id: '2',
    content: 'I need help with React development',
    sender: 'user',
    timestamp: new Date(),
  },
];

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>(mockMessages);
  const [isTyping, setIsTyping] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState('gpt-3.5');

  const handleSendMessage = (content: string, modelId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand you need help with React. What specific aspect would you like to explore?',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <ChatInput 
          onSendMessage={handleSendMessage}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  );
};
