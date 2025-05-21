import React from 'react';
import { Message } from '../../types/chat';
import { Timestamp } from '../common/Timestamp';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div
      className={`flex flex-col ${
        message.sender === 'ai' ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`chat-bubble ${
          message.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'
        }`}
      >
        {message.content}
      </div>
      <Timestamp date={message.timestamp} />
    </div>
  );
};
