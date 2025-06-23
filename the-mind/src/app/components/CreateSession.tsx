// src/app/components/CreateSession.tsx
'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './styles/CreateSession.css';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface CreateSessionProps {
  navigate: (page: CurrentPage, sessionId?: string) => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ navigate }) => {
  const { playerId, nickname, createSession, joinSession, isLoading, error, clearError } = useGame();
  
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [sessionCode, setSessionCode] = useState('');

  // Redirect if player not set up
  React.useEffect(() => {
    if (!playerId || !nickname) {
      navigate('setup');
    }
  }, [playerId, nickname, navigate]);

  const handleCreateSession = async () => {
    if (!playerId || !nickname) {
      navigate('setup');
      return;
    }

    try {
      const sessionId = await createSession(maxPlayers);
      if (sessionId) {
        navigate('lobby', sessionId);
      }
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      return;
    }

    try {
      const sessionId = await joinSession(sessionCode.trim());
      if (sessionId) {
        navigate('lobby', sessionId);
      }
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="create-session">
      <div className="session-container">
        <button 
          className="back-button"
          onClick={() => navigate('setup')}
        >
          ← Înapoi
        </button>

        <div className="session-header">
          <h1>Joc Online</h1>
          <p className="player-welcome">
            Bună, <strong>{nickname}</strong>! Alege o opțiune pentru a începe să joci online.
          </p>
        </div>

        <div className="options-container">
          {/* Create New Session */}
          <div className="option-card">
            <h2>Creează Sesiune Nouă</h2>
            
            <div className="player-count-selector">
              <label>Numărul maxim de jucători:</label>
              <div className="player-buttons">
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    className={`player-count-btn ${maxPlayers === count ? 'active' : ''}`}
                    onClick={() => setMaxPlayers(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="create-button"
              onClick={handleCreateSession}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Se creează...' : '🎯 Creează Sesiune'}
            </button>
          </div>

          {/* Join Existing Session */}
          <div className="option-card">
            <h2>Alătură-te unei Sesiuni</h2>
            
            <div className="join-input-group">
              <label htmlFor="sessionCode">Codul sesiunii:</label>
              <input
                type="text"
                id="sessionCode"
                value={sessionCode}
                onChange={(e) => {
                  setSessionCode(e.target.value.toUpperCase());
                  if (error) clearError();
                }}
                placeholder="ABCD12"
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
              <div className="input-hint">
                Introdu codul primit de la gazda sesiunii
              </div>
            </div>

            <button 
              className="join-button"
              onClick={handleJoinSession}
              disabled={!sessionCode.trim() || isLoading}
            >
              {isLoading ? '🔄 Se alătură...' : '🚀 Alătură-te'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSession;