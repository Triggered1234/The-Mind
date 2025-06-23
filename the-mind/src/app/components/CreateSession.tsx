// src/app/components/CreateSession.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
  const [isJoining, setIsJoining] = useState(false);

  // Redirect if player not set up
  useEffect(() => {
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
      clearError(); // Clear any previous errors
      const sessionId = await createSession(maxPlayers);
      if (sessionId) {
        console.log('Session created successfully:', sessionId);
        navigate('lobby', sessionId);
      } else {
        console.error('Failed to create session - no session ID returned');
      }
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      alert('Te rog introdu codul sesiunii');
      return;
    }

    if (!playerId || !nickname) {
      navigate('setup');
      return;
    }

    setIsJoining(true);
    try {
      clearError(); // Clear any previous errors
      const sessionId = await joinSession(sessionCode.trim().toUpperCase());
      if (sessionId) {
        console.log('Joined session successfully:', sessionId);
        navigate('lobby', sessionId);
      } else {
        console.error('Failed to join session - no session ID returned');
      }
    } catch (err) {
      console.error('Error joining session:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSessionCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 10); // Limit length and convert to uppercase
    setSessionCode(value);
    if (error) {
      clearError();
    }
  };

  return (
    <div className="create-session">
      <div className="session-container">
        <button 
          className="back-button"
          onClick={() => navigate('setup')}
          disabled={isLoading || isJoining}
        >
          ← Înapoi
        </button>

        <div className="session-header">
          <h1>Joc Online</h1>
          <p className="player-welcome">
            Bună, <strong>{nickname}</strong>! Alege o opțiune pentru a începe să joci online.
          </p>
          {playerId && (
            <p className="player-id">ID Jucător: {playerId.slice(-8)}</p>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
            <button onClick={clearError}>✖</button>
          </div>
        )}

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
                    disabled={isLoading || isJoining}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="create-button"
              onClick={handleCreateSession}
              disabled={isLoading || isJoining}
            >
              {isLoading ? '⏳ Se creează sesiunea...' : '🎯 Creează Sesiune'}
            </button>
          </div>

          {/* Join Existing Session */}
          <div className="option-card">
            <h2>Alătură-te la o Sesiune</h2>
            
            <div className="session-code-input">
              <label htmlFor="sessionCode">Codul sesiunii:</label>
              <input
                type="text"
                id="sessionCode"
                value={sessionCode}
                onChange={handleSessionCodeChange}
                placeholder="Introdu codul sesiunii"
                maxLength={10}
                disabled={isLoading || isJoining}
              />
            </div>

            <button 
              className="join-button"
              onClick={handleJoinSession}
              disabled={!sessionCode.trim() || isLoading || isJoining}
            >
              {isJoining ? '⏳ Se alătură...' : '🚀 Alătură-te'}
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>ℹ️ Informații</h3>
          <ul>
            <li>Sesiunile sunt valabile pentru 24 de ore</li>
            <li>Poți juca cu 2-4 jucători</li>
            <li>Codul sesiunii este generat automat</li>
            <li>Partajează codul cu prietenii pentru a se alătura</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;