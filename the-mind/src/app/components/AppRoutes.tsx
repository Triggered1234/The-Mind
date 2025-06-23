
// src/app/components/AppRoutes.tsx  
'use client';

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import Home from './Home';
import SetupPlayer from './SetupPlayer';
import CreateSession from './CreateSession';
import JoinSession from './JoinSession';
import Lobby from './Lobby';
import GameBoard from './GameBoard';
import Rules from './Rules';
import Settings from './Settings';

const AppRoutes: React.FC = () => {
  return (
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
  );
};

export default AppRoutes;