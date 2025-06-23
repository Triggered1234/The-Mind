// src/app/components/SetupPlayer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import './styles/SetupPlayer.css';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface SetupPlayerProps {
  navigate: (page: CurrentPage) => void;
}

const SetupPlayer: React.FC<SetupPlayerProps> = ({ navigate }) => {
  const { setPlayer, playerId, nickname } = useGame();
  const [tempNickname, setTempNickname] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is authenticated or guest
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('themind_username');
      const guestFlag = localStorage.getItem('themind_is_guest');
      
      if (storedUsername) {
        setUsername(storedUsername);
        setTempNickname(storedUsername);
        setIsGuest(guestFlag === 'true');
      } else {
        // Redirect to auth if no user info
        navigate('auth');
        return;
      }
    }
  }, [navigate]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // Limit to 20 characters
    setTempNickname(value);
  };

  const handleSaveNickname = () => {
    if (tempNickname.trim().length < 2) {
      alert('Numele trebuie să aibă cel puțin 2 caractere');
      return;
    }

    // Set player info in game context
    setPlayer(tempNickname.trim());
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('themind_username', tempNickname.trim());
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('themind_user_token');
      localStorage.removeItem('themind_user_id');
      localStorage.removeItem('themind_username');
      localStorage.removeItem('themind_is_guest');
    }
    navigate('home');
  };

  const canProceed = tempNickname.trim().length >= 2;

  return (
    <div className="setup-page">
      <div className="setup-container">
        <button 
          className="back-button"
          onClick={() => navigate('home')}
        >
          ← Înapoi
        </button>

        <button 
          className="logout-button"
          onClick={handleLogout}
        >
          {isGuest ? '🚪 Ieși din Invitat' : '🔓 Deconectare'}
        </button>

        <div className="setup-header">
          <h1>Configurare Jucător</h1>
          <p>Personalizează-ți numele pentru joc</p>
        </div>

        <div className="nickname-section">
          <div className="input-group">
            <label htmlFor="nickname">Numele tău în joc</label>
            <input
              type="text"
              id="nickname"
              value={tempNickname}
              onChange={handleNicknameChange}
              placeholder="Introdu numele pentru joc"
              maxLength={20}
            />
            <div className="char-count">
              {tempNickname.length}/20 caractere
            </div>
          </div>

          <button 
            className={`save-button ${canProceed ? '' : 'disabled'}`}
            onClick={handleSaveNickname}
            disabled={!canProceed}
          >
            💾 Salvează Numele
          </button>
        </div>

        {playerId && nickname && (
          <div className="player-info">
            <div className="player-id">
              ID Jucător: {playerId}
            </div>
            
            <div className="next-steps">
              <h3>Următorii pași:</h3>
              <ul>
                <li>✅ Profil configurat cu succes</li>
                <li>🎮 Poți să creezi o sesiune nouă</li>
                <li>🌐 Sau să te alături unei sesiuni existente</li>
              </ul>

              <div className="action-buttons">
                <button 
                  className="create-session-button"
                  onClick={() => navigate('create')}
                >
                  🎯 Creează Sesiune Nouă
                </button>
                
                <button 
                  className="join-session-button"
                  onClick={() => navigate('join')}
                >
                  🚀 Alătură-te la o Sesiune
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupPlayer;