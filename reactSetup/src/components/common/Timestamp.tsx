import React from 'react';

interface TimestampProps {
  date: Date;
}

export const Timestamp: React.FC<TimestampProps> = ({ date }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <span className="text-xs text-gray-500 mt-1">
      {formatTime(date)}
    </span>
  );
};
