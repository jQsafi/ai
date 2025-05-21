import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200"></div>
    </div>
  );
};
