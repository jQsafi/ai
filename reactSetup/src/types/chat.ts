export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AIPersonality {
  id: string;
  name: string;
  avatar: string;
  description: string;
}
