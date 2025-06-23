// src/app/components/SetupPlayer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface SetupPlayerProps {
  navigate: (page: CurrentPage) => void;
}

const SetupPlayer: React.FC<SetupPlayerProps> = ({ navigate }) => {
  const { playerId, nickname, setPlayer, error, clearError } = useGame();
  
  const [inputNickname, setInputNickname] = useState(nickname || '');
  const [isValid, setIsValid] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (nickname) {
      setInputNickname(nickname);
    }

    // Load username from localStorage if logged in
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('themind_username');
      if (savedUsername) {
        setUsername(savedUsername);
        if (!inputNickname) {
          setInputNickname(savedUsername);
        }
      }
    }
  }, [nickname]);

  useEffect(() => {
    setIsValid(inputNickname.trim().length >= 2 && inputNickname.trim().length <= 20);
  }, [inputNickname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) return;

    const trimmedNickname = inputNickname.trim();
    const newPlayerId = playerId || `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setPlayer(newPlayerId, trimmedNickname);
    navigate('create');
  };

  const handleBack = () => {
    navigate('home');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('themind_user_token');
      localStorage.removeItem('themind_user_id');
      localStorage.removeItem('themind_username');
      localStorage.removeItem('themind_player_id');
      localStorage.removeItem('themind_nickname');
    }
    navigate('home');
  };

  return (
    <div className="setup-player">
      <div className="setup-container">
        <button className="back-button" onClick={handleBack}>
          ← Înapoi
        </button>

        {username && (
          <button className="logout-button" onClick={handleLogout}>
            🚪 Deconectare
          </button>
        )}

        <h1 className="title">Configurare Jucător</h1>
        
        {username && (
          <div className="user-info">
            <p>Conectat ca: <strong>{username}</strong></p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="input-group">
            <label htmlFor="nickname">Nume în joc:</label>
            <input
              id="nickname"
              type="text"
              value={inputNickname}
              onChange={(e) => {
                setInputNickname(e.target.value);
                if (error) clearError();
              }}
              placeholder="Cum vrei să te vadă ceilalți jucători?"
              maxLength={20}
              autoFocus
            />
            <div className="input-hint">
              {inputNickname.length}/20 caractere (minim 2)
            </div>
            <div className="input-help">
              Acesta este numele care va fi afișat în joc celorlalți jucători.
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={`continue-button ${!isValid ? 'disabled' : ''}`}
            disabled={!isValid}
          >
            Continuă către Joc
          </button>
        </form>

        <div className="player-info">
          {playerId && (
            <p className="player-id">ID Jucător: {playerId}</p>
          )}
          
          <div className="next-steps">
            <h3>Ce urmează:</h3>
            <ul>
              <li>🎮 Creează o sesiune de joc nouă</li>
              <li>🔗 Sau alătură-te unei sesiuni existente</li>
              <li>👥 Invită prietenii tăi să se alăture</li>
              <li>🃏 Jucați împreună "The Mind"!</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .setup-player {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .setup-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 10px 15px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .logout-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: 2px solid rgba(255, 107, 107, 0.3);
          color: #ff6b6b;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
        }

        .title {
          color: white;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .user-info {
          background: rgba(76, 175, 80, 0.2);
          border: 1px solid rgba(76, 175, 80, 0.4);
          border-radius: 10px;
          padding: 10px;
          margin-bottom: 30px;
        }

        .user-info p {
          color: #4CAF50;
          font-size: 14px;
          margin: 0;
        }

        .setup-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .input-group {
          text-align: left;
        }

        .input-group label {
          display: block;
          color: white;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .input-group input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 16px;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #C2730A;
          background: rgba(255, 255, 255, 0.2);
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .input-hint {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          margin-top: 5px;
        }

        .input-help {
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
          margin-top: 8px;
          font-style: italic;
        }

        .continue-button {
          background: linear-gradient(45deg, #C2730A, #824728);
          border: none;
          color: white;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .continue-button:hover:not(.disabled) {
          background: linear-gradient(45deg, #D68A0B, #A05832);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(194, 115, 10, 0.4);
        }

        .continue-button.disabled {
          background: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .error-message {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.5);
          color: #ff6b6b;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
        }

        .player-info {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          text-align: left;
        }

        .player-id {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          font-family: monospace;
          text-align: center;
          margin-bottom: 20px;
        }

        .next-steps {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 20px;
        }

        .next-steps h3 {
          color: #C2730A;
          font-size: 16px;
          margin-bottom: 15px;
        }

        .next-steps ul {
          color: rgba(255, 255, 255, 0.8);
          padding-left: 0;
          list-style: none;
        }

        .next-steps li {
          padding: 5px 0;
          font-size: 14px;
        }

        @media (max-width: 600px) {
          .setup-container {
            padding: 30px 20px;
          }

          .title {
            font-size: 24px;
          }

          .back-button, .logout-button {
            font-size: 12px;
            padding: 8px 12px;
          }

          .logout-button {
            top: 60px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default SetupPlayer;