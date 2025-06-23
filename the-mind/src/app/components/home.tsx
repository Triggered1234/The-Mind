// src/app/components/Home.tsx
'use client';

import React, { useEffect, useState } from 'react';
import './styles/Home.css';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface HomeProps {
  navigate: (page: CurrentPage) => void;
}

const Home: React.FC<HomeProps> = ({ navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('themind_user_token');
      setIsAuthenticated(!!token);
    }
  }, []);

  const handlePlayClick = () => {
    if (isAuthenticated) {
      navigate('setup');
    } else {
      navigate('auth');
    }
  };

  const handleOnlineClick = () => {
    if (isAuthenticated) {
      navigate('setup');
    } else {
      navigate('auth');
    }
  };

  return (
    <div className="home">
      {/* Background ellipse */}
      <div className="ellipse-5"></div>
      
      {/* Logo */}
      <div className="logo-the-mind">
        <h1 className="game-title">THE MIND</h1>
        <p className="game-subtitle">Joc de Cărți Cooperativ</p>
        {isAuthenticated && (
          <p className="user-status">✅ Autentificat</p>
        )}
      </div>
      
      {/* Buttons in a circular layout */}
      <div className="buttons-container">
        <button className="menu-button play" onClick={handlePlayClick}>
          🎮 JOACĂ
        </button>
        <button className="menu-button online" onClick={handleOnlineClick}>
          🌐 ONLINE
        </button>
        <button className="menu-button rules" onClick={() => navigate('rules')}>
          📖 REGULI
        </button>
        <button className="menu-button settings" onClick={() => navigate('settings')}>
          ⚙️ SETĂRI
        </button>
        <button className="menu-button auth" onClick={() => navigate('auth')}>
          {isAuthenticated ? '👤 PROFIL' : '🔐 CONT'}
        </button>
      </div>

      {/* Quick info */}
      <div className="info-panel">
        <p>
          {isAuthenticated 
            ? 'Bine ai revenit! Poți începe să joci.' 
            : 'Creează un cont pentru a salva progresul sau joacă ca invitat.'
          }
        </p>
      </div>
    </div>
  );
};

export default Home;