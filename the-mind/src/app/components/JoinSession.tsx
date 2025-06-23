// src/app/components/JoinSession.tsx
'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './styles/JoinSession.css';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface JoinSessionProps {
  navigate: (page: CurrentPage, sessionId?: string) => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ navigate }) => {
  const { playerId, nickname, joinSession, isLoading, error, clearError } = useGame();
  const [sessionCode, setSessionCode] = useState('');

  // Redirect if player not set up
  React.useEffect(() => {
    if (!playerId || !nickname) {
      navigate('setup');
    }
  }, [playerId, nickname, navigate]);

  const handleSessionCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setSessionCode(value);
    if (error) clearError();
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

  const canJoin = sessionCode.trim().length >= 4 && !isLoading;

  return (
    <div className="join-page">
      <div className="join-container">
        <button 
          className="back-button"
          onClick={() => navigate('setup')}
        >
          ← Înapoi
        </button>

        <div className="join-header">
          <h1>Alătură-te la o Sesiune</h1>
          <p className="player-welcome">
            Bună, <strong>{nickname}</strong>! Introdu codul sesiunii pentru a te alătura.
          </p>
        </div>

        <div className="join-form">
          <div className="input-group">
            <label htmlFor="sessionCode">Cod Sesiune</label>
            <input
              type="text"
              id="sessionCode"
              value={sessionCode}
              onChange={handleSessionCodeChange}
              placeholder="ABCD12"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="input-hint">
              Codul sesiunii are de obicei 4-6 caractere
            </div>
          </div>

          <button 
            className={`join-button ${canJoin ? '' : 'disabled'}`}
            onClick={handleJoinSession}
            disabled={!canJoin}
          >
            {isLoading ? '🔄 Se alătură...' : '🚀 Alătură-te la Sesiune'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError}>✕</button>
          </div>
        )}

        <div className="help-text">
          <h3>Nu ai un cod de sesiune?</h3>
          <p>
            Cere-i organizatorului să îți trimită codul sesiunii, sau creează o sesiune nouă.
          </p>
          <button 
            className="create-new-button"
            onClick={() => navigate('create')}
          >
            📝 Creează Sesiune Nouă
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinSession;