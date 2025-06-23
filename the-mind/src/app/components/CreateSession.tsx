// src/app/components/CreateSession.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const { playerId, nickname, createSession, isLoading, error, clearError } = useGame();
  
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [sessionCode, setSessionCode] = useState('');

  const handleCreateSession = async () => {
    if (!playerId || !nickname) {
      navigate('/setup');
      return;
    }

    try {
      await createSession(maxPlayers);
      // Navigation will be handled by the context when session is created
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      navigate(`/join?code=${sessionCode.trim()}`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // Redirect to lobby when session is created
  React.useEffect(() => {
    if (playerId && nickname) {
      // Session was created successfully, navigate to lobby
      const sessionId = window.location.pathname.includes('/lobby/') ? 
        window.location.pathname.split('/lobby/')[1] : null;
      
      if (sessionId) {
        navigate(`/lobby/${sessionId}`);
      }
    }
  }, [playerId, nickname, navigate]);

  return (
    <div className="create-session">
      <div className="session-container">
        <button className="back-button" onClick={handleBack}>
          ← Înapoi
        </button>

        <h1 className="title">Joc Online</h1>
        
        <div className="player-welcome">
          Bună, <strong>{nickname || 'Jucător'}</strong>!
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
              {isLoading ? 'Se creează...' : 'Creează Sesiune'}
            </button>
          </div>

          {/* Join Existing Session */}
          <div className="option-card">
            <h2>Alătură-te unei Sesiuni</h2>
            
            <div className="join-input-group">
              <label>Codul sesiunii:</label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => {
                  setSessionCode(e.target.value.toUpperCase());
                  if (error) clearError();
                }}
                placeholder="ABC-123"
                maxLength={10}
              />
            </div>

            <button 
              className="join-button"
              onClick={handleJoinSession}
              disabled={!sessionCode.trim() || isLoading}
            >
              Alătură-te
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        .create-session {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .session-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 800px;
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
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .player-welcome {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          margin-bottom: 40px;
        }

        .options-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .option-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
        }

        .option-card h2 {
          color: white;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 25px;
        }

        .player-count-selector {
          margin-bottom: 25px;
        }

        .player-count-selector label {
          display: block;
          color: white;
          font-size: 16px;
          margin-bottom: 15px;
        }

        .player-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .player-count-btn {
          width: 50px;
          height: 50px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .player-count-btn:hover {
          border-color: #C2730A;
          background: rgba(194, 115, 10, 0.2);
        }

        .player-count-btn.active {
          border-color: #C2730A;
          background: linear-gradient(45deg, #C2730A, #824728);
        }

        .join-input-group {
          margin-bottom: 25px;
        }

        .join-input-group label {
          display: block;
          color: white;
          font-size: 16px;
          margin-bottom: 10px;
        }

        .join-input-group input {
          width: 100%;
          max-width: 200px;
          padding: 12px 15px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 16px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: monospace;
          box-sizing: border-box;
        }

        .join-input-group input:focus {
          outline: none;
          border-color: #C2730A;
          background: rgba(255, 255, 255, 0.2);
        }

        .join-input-group input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .create-button, .join-button {
          background: linear-gradient(45deg, #C2730A, #824728);
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .create-button:hover:not(:disabled), .join-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #D68A0B, #A05832);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(194, 115, 10, 0.4);
        }

        .create-button:disabled, .join-button:disabled {
          background: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .error-message {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.5);
          color: #ff6b6b;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .options-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .session-container {
            padding: 30px 20px;
          }

          .title {
            font-size: 24px;
          }

          .option-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateSession;