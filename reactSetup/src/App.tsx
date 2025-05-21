import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatContainer } from './components/Chat/ChatContainer';
import { Header } from './components/common/Header';

const App: React.FC = () => {
  const [activePersonality, setActivePersonality] = useState('1');

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePersonality={activePersonality}
          onPersonalityChange={setActivePersonality}
        />
        <ChatContainer />
      </div>
    </div>
  );
};

export default App;
