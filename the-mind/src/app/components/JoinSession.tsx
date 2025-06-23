// src/app/components/JoinSession.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const JoinSession: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playerId, nickname, joinSession, isLoading, error, clearError } = useGame();
  
  const [sessionCode, setSessionCode] = useState(searchParams.get('code') || '');

  useEffect(() => {
    if (!playerId || !nickname) {
      navigate('/setup');
      return;
    }
  }, [playerId, nickname, navigate]);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim()) return;

    try {
      await joinSession(sessionCode.trim());
      navigate(`/lobby/${sessionCode.trim()}`);
    } catch (err) {
      console.error('Failed to join session:', err);
    }
  };

  const handleBack = () => {
    navigate('/create');
  };

  return (
    <div className="join-session">
      <div className="join-container">
        <button className="back-button" onClick={handleBack}>
          ← Înapoi
        </button>

        <h1 className="title">Alătură-te unei Sesiuni</h1>
        
        <div className="player-info">
          Bună, <strong>{nickname}</strong>!
        </div>

        <form onSubmit={handleJoinSession} className="join-form">
          <div className="input-group">
            <label htmlFor="sessionCode">Codul sesiunii:</label>
            <input
              id="sessionCode"
              type="text"
              value={sessionCode}
              onChange={(e) => {
                setSessionCode(e.target.value.toUpperCase());
                if (error) clearError();
              }}
              placeholder="Introduceți codul sesiunii"
              maxLength={50}
              autoFocus
            />
            <div className="input-hint">
              Introduceți codul primit de la gazda sesiunii
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={`join-button ${!sessionCode.trim() ? 'disabled' : ''}`}
            disabled={!sessionCode.trim() || isLoading}
          >
            {isLoading ? 'Se alătură...' : 'Alătură-te'}
          </button>
        </form>

        <div className="help-text">
          <h3>Nu ai un cod de sesiune?</h3>
          <p>Cere-i organizatorului să îți trimită codul sesiunii sau</p>
          <button 
            className="create-new-button"
            onClick={() => navigate('/create')}
          >
            Creează o sesiune nouă
          </button>
        </div>
      </div>

      <style jsx>{`
        .join-session {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .join-container {
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

        .title {
          color: white;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .player-info {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin-bottom: 30px;
        }

        .join-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .input-group {
          text-align: left;
        }

        .input-group label {
          display: block;
          color: white;
          font-size: 16px;
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
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: monospace;
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
          text-transform: none;
          letter-spacing: normal;
          font-family: inherit;
        }

        .input-hint {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          margin-top: 5px;
          text-align: center;
        }

        .join-button {
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

        .join-button:hover:not(.disabled) {
          background: linear-gradient(45deg, #D68A0B, #A05832);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(194, 115, 10, 0.4);
        }

        .join-button.disabled {
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

        .help-text {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 30px;
        }

        .help-text h3 {
          color: white;
          font-size: 18px;
          margin-bottom: 10px;
        }

        .help-text p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 15px;
        }

        .create-new-button {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .create-new-button:hover {
          border-color: #C2730A;
          background: rgba(194, 115, 10, 0.2);
        }

        @media (max-width: 600px) {
          .join-container {
            padding: 30px 20px;
          }

          .title {
            font-size: 24px;
          }

          .back-button {
            font-size: 12px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default JoinSession;