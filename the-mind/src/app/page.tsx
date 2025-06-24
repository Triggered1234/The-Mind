// src/app/page.tsx - Main page (Next.js App Router)
'use client';

import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import Home from './components/Home';
import SetupPlayer from './components/SetupPlayer';
import CreateSession from './components/CreateSession';
import AuthPage from './components/AuthPage';
import JoinSession from './components/JoinSession';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Rules from './components/Rules';
import Settings from './components/Settings';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

export default function Page() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const navigate = (page: CurrentPage, id?: string) => {
    console.log('Navigating to:', page, 'with sessionId:', id); // Debug log
    setCurrentPage(page);
    if (id) setSessionId(id);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'auth':
        return <AuthPage navigate={navigate} />;
      case 'setup':
        return <SetupPlayer navigate={navigate} />;
      case 'create':
        return <CreateSession navigate={navigate} />;
      case 'join':
        return <JoinSession navigate={navigate} />;
      case 'lobby':
        return <Lobby sessionId={sessionId} navigate={navigate} />;
      case 'game':
        return <GameBoard sessionId={sessionId} navigate={navigate} />;
      case 'rules':
        return <Rules navigate={navigate} />;
      case 'settings':
        return <Settings navigate={navigate} />;
      default:
        console.warn('Unknown page:', currentPage, 'redirecting to home');
        return <Home navigate={navigate} />;
    }
  };

  return (
    <GameProvider>
      <div className="app">
        {renderCurrentPage()}
      </div>
    </GameProvider>
  );
}