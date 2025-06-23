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
  const { setPlayer, playerId, nickname, error, clearError } = useGame();
  const [tempNickname, setTempNickname] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    // If we already have a nickname, set it as temp nickname
    if (nickname && !tempNickname) {
      setTempNickname(nickname);
    }
  }, [nickname, tempNickname]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // Limit to 20 characters
    setTempNickname(value);
    // Clear any existing errors
    if (error) {
      clearError();
    }
  };

  const handleSaveNickname = async () => {
    if (tempNickname.trim().length < 2) {
      alert('Numele trebuie să aibă cel puțin 2 caractere');
      return;
    }

    setIsLoading(true);
    
    try {
      // Set player info in game context - this will generate a new player ID
      setPlayer(tempNickname.trim());
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('themind_username', tempNickname.trim());
      }
      
      console.log('Player saved successfully:', tempNickname.trim());
    } catch (err) {
      console.error('Error saving player:', err);
      alert('Eroare la salvarea jucătorului. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('themind_user_token');
      localStorage.removeItem('themind_user_id');
      localStorage.removeItem('themind_username');
      localStorage.removeItem('themind_is_guest');
      localStorage.removeItem('themind_player_id');
      localStorage.removeItem('themind_nickname');
    }
    navigate('home');
  };

  const canProceed = tempNickname.trim().length >= 2 && !isLoading;

  return (
    <div className="setup-page">
      <div className="setup-container">
        <button 
          className="back-button"
          onClick={() => navigate('home')}
          disabled={isLoading}
        >
          ← Înapoi
        </button>

        <button 
          className="logout-button"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isGuest ? '🚪 Ieși din Invitat' : '🔓 Deconectare'}
        </button>

        <div className="setup-header">
          <h1>Configurare Jucător</h1>
          <p>Personalizează-ți numele pentru joc</p>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
            <button onClick={clearError}>✖</button>
          </div>
        )}

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
              disabled={isLoading}
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
            {isLoading ? '⏳ Se salvează...' : '💾 Salvează Numele'}
          </button>
        </div>

        {playerId && nickname && (
          <div className="player-info">
            <div className="success-message">
              ✅ Profil configurat cu succes!
            </div>
            
            <div className="player-details">
              <div className="player-nickname">
                <strong>Nume joc:</strong> {nickname}
              </div>
              <div className="player-id">
                <strong>ID Jucător:</strong> {playerId.slice(-8)}
              </div>
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