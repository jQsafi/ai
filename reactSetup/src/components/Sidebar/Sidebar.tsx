import React from 'react';
import { PersonalityCard } from './PersonalityCard';
import { AIPersonality } from '../../types/chat';

const personalities: AIPersonality[] = [
  {
    id: '1',
    name: 'Creative Assistant',
    avatar: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=100',
    description: 'Helps with creative tasks',
  },
  {
    id: '2',
    name: 'Code Expert',
    avatar: 'https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=100',
    description: 'Technical programming help',
  },
];

interface SidebarProps {
  activePersonality: string;
  onPersonalityChange: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePersonality,
  onPersonalityChange,
}) => {
  return (
    <div className="w-[280px] border-r border-gray-200 h-screen p-4">
      <h2 className="heading-font text-xl font-medium mb-6">AI Assistants</h2>
      <div className="space-y-2">
        {personalities.map((personality) => (
          <PersonalityCard
            key={personality.id}
            personality={personality}
            isActive={activePersonality === personality.id}
            onClick={() => onPersonalityChange(personality.id)}
          />
        ))}
      </div>
    </div>
  );
};
