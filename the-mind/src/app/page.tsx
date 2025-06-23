// src/app/page.tsx - Main page (Next.js App Router)
'use client';

import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import Home from './components/Home';
import SetupPlayer from './components/SetupPlayer';
import CreateSession from './components/CreateSession';
import AuthPage from './components/AuthPage';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

export default function Page() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const navigate = (page: CurrentPage, id?: string) => {
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
      case 'rules':
        return <RulesPage navigate={navigate} />;
      case 'settings':
        return <SettingsPage navigate={navigate} />;
      default:
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

// Simple Rules component
function RulesPage({ navigate }: { navigate: (page: CurrentPage) => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%)',
      padding: '20px',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        position: 'relative'
      }}>
        <button 
          onClick={() => navigate('home')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'transparent',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          ← Înapoi
        </button>

        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Regulile Jocului "The Mind"</h1>
        
        <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
          <h2 style={{ color: '#C2730A', marginBottom: '15px' }}>🎯 Obiectivul Jocului</h2>
          <p style={{ marginBottom: '20px' }}>
            "The Mind" este un joc cooperativ în care jucătorii trebuie să joace toate cărțile 
            lor în ordine crescătoare, fără a comunica între ei!
          </p>

          <h2 style={{ color: '#C2730A', marginBottom: '15px' }}>🃏 Cum se Joacă</h2>
          <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
            <li>La Nivelul 1: Fiecare jucător primește 1 carte</li>
            <li>La Nivelul 2: Fiecare jucător primește 2 cărți</li>
            <li>Cărțile au valori de la 1 la 100</li>
            <li>Trebuie să jucați toate cărțile în ordine crescătoare</li>
            <li><strong>IMPORTANT:</strong> Nu aveți voie să comunicați!</li>
          </ul>

          <h2 style={{ color: '#C2730A', marginBottom: '15px' }}>❤️ Vieți și Shurikens</h2>
          <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
            <li>Începeți cu 3 vieți și 1 shuriken</li>
            <li>Pierdeți o viață dacă jucați o carte greșită</li>
            <li>Un shuriken elimină cartea cea mai mică din toate mâinile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
