import React from 'react';
import { AIPersonality } from '../../types/chat';

interface PersonalityCardProps {
  personality: AIPersonality;
  isActive: boolean;
  onClick: () => void;
}

export const PersonalityCard: React.FC<PersonalityCardProps> = ({
  personality,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={`personality-card ${
        isActive ? 'bg-accent' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <img
          src={personality.avatar}
          alt={personality.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3 className="heading-font font-medium text-base">
            {personality.name}
          </h3>
          <p className="text-sm text-gray-600">{personality.description}</p>
        </div>
      </div>
    </div>
  );
};
