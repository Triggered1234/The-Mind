// src/app/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';

// Components
import Home from './components/Home';
import SetupPlayer from './components/SetupPlayer';
import CreateSession from './components/CreateSession';
import JoinSession from './components/JoinSession';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Rules from './components/Rules';
import Settings from './components/Settings';

const App: React.FC = () => {
  return (
    <GameProvider>
      <div className="app">
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />
          
          {/* Player setup */}
          <Route path="/setup" element={<SetupPlayer />} />
          
          {/* Online game routes */}
          <Route path="/online" element={<Navigate to="/setup" replace />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/join" element={<JoinSession />} />
          <Route path="/lobby/:sessionId" element={<Lobby />} />
          <Route path="/game/:sessionId" element={<GameBoard />} />
          
          {/* Other routes */}
          <Route path="/rules" element={<Rules />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GameProvider>
  );
};

export default App;