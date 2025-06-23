// src/app/components/Lobby.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Player } from '../services/api';

const CHARACTERS = [
  { id: 'ninja', name: 'Ninja', emoji: '🥷' },
  { id: 'samurai', name: 'Samurai', emoji: '🗾' },
  { id: 'monk', name: 'Călugăr', emoji: '🧘‍♂️' },
  { id: 'warrior', name: 'Războinic', emoji: '⚔️' },
];

const Lobby: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { 
    playerId, 
    nickname, 
    session, 
    gameState,
    joinSession, 
    leaveSession, 
    toggleReady, 
    startGame,
    chooseCharacter,
    refreshGameState,
    isLoading, 
    error,
    clearError 
  } = useGame();

  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/create');
      return;
    }

    if (!playerId || !nickname) {
      navigate('/setup');
      return;
    }

    // If we don't have session data, try to join
    if (!session || session.session_id !== sessionId) {
      joinSession(sessionId);
    }

    // Start polling for updates
    const interval = setInterval(() => {
      refreshGameState();
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, playerId, nickname, session]);

  // Navigate to game when it starts
  useEffect(() => {
    if (session?.status === 'started' || gameState?.status === 'playing') {
      navigate(`/game/${sessionId}`);
    }
  }, [session?.status, gameState?.status, navigate, sessionId]);

  const handleCharacterSelect = async (characterId: string) => {
    if (!sessionId || !playerId) return;
    
    setSelectedCharacter(characterId);
    try {
      await chooseCharacter(sessionId, playerId, characterId);
    } catch (err) {
      console.error('Failed to choose character:', err);
    }
  };

  const handleToggleReady = async () => {
    try {
      await toggleReady();
    } catch (err) {
      console.error('Failed to toggle ready:', err);
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame();
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  const handleLeaveSession = async () => {
    try {
      await leaveSession();
      navigate('/create');
    } catch (err) {
      console.error('Failed to leave session:', err);
    }
  };

  const copySessionCode = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopyMessage('Copiat!');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const currentPlayer = session?.players.find(p => p.player_id === playerId);
  const isReady = currentPlayer?.is_ready || false;
  const allPlayersReady = session?.players.every(p => p.is_ready) || false;
  const canStartGame = session && session.players.length >= 2 && allPlayersReady;

  if (!session) {
    return (
      <div className="lobby loading">
        <div className="loading-message">
          Se încarcă sesiunea...
        </div>
      </div>
    );
  }

  return (
    <div className="lobby">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1>Lobby - Sesiunea {sessionId?.slice(-6).toUpperCase()}</h1>
          <div className="session-code-container">
            <span className="session-code">{sessionId}</span>
            <button className="copy-button" onClick={copySessionCode}>
              {copyMessage || 'Copiază Cod'}
            </button>
          </div>
        </div>

        <div className="lobby-content">
          {/* Players List */}
          <div className="players-section">
            <h2>Jucători ({session.players.length}/{session.max_players})</h2>
            <div className="players-grid">
              {session.players.map((player: Player, index: number) => (
                <div 
                  key={player.player_id} 
                  className={`player-card ${player.is_ready ? 'ready' : ''} ${player.player_id === playerId ? 'me' : ''}`}
                >
                  <div className="player-character">
                    {player.character_id && CHARACTERS.find(c => c.id === player.character_id)?.emoji || '👤'}
                  </div>
                  <div className="player-name">{player.nickname}</div>
                  <div className="player-status">
                    {player.is_ready ? '✅ Gata' : '⏳ Nu e gata'}
                  </div>
                  {player.player_id === playerId && (
                    <div className="player-badge">Tu</div>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: session.max_players - session.players.length }).map((_, index) => (
                <div key={`empty-${index}`} className="player-card empty">
                  <div className="player-character">⭕</div>
                  <div className="player-name">Se așteaptă jucător...</div>
                </div>
              ))}
            </div>
          </div>

          {/* Character Selection */}
          <div className="character-section">
            <h3>Alege Caracterul Tău</h3>
            <div className="character-grid">
              {CHARACTERS.map((character) => (
                <button
                  key={character.id}
                  className={`character-button ${currentPlayer?.character_id === character.id ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect(character.id)}
                >
                  <div className="character-emoji">{character.emoji}</div>
                  <div className="character-name">{character.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Controls */}
          <div className="controls-section">
            <div className="ready-section">
              <button 
                className={`ready-button ${isReady ? 'ready' : ''}`}
                onClick={handleToggleReady}
                disabled={isLoading}
              >
                {isReady ? '✅ Gata' : '⏳ Marchează Gata'}
              </button>
            </div>

            {allPlayersReady && session.players.length >= 2 && (
              <div className="start-section">
                <button 
                  className="start-button"
                  onClick={handleStartGame}
                  disabled={!canStartGame || isLoading}
                >
                  🎮 Pornește Jocul
                </button>
              </div>
            )}

            <button className="leave-button" onClick={handleLeaveSession}>
              🚪 Părăsește Sesiunea
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

      <style jsx>{`
        .lobby {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          padding: 20px;
        }

        .lobby.loading {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-message {
          color: white;
          font-size: 24px;
          text-align: center;
        }

        .lobby-container {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
        }

        .lobby-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .lobby-header h1 {
          color: white;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 15px;
        }

        .session-code-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
        }

        .session-code {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 16px;
          letter-spacing: 2px;
        }

        .copy-button {
          background: #C2730A;
          border: none;
          color: white;
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .copy-button:hover {
          background: #D68A0B;
        }

        .lobby-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .players-section h2 {
          color: white;
          font-size: 22px;
          margin-bottom: 20px;
          text-align: center;
        }

        .players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .player-card {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .player-card.ready {
          border-color: #4CAF50;
          background: rgba(76, 175, 80, 0.2);
        }

        .player-card.me {
          border-color: #C2730A;
          background: rgba(194, 115, 10, 0.2);
        }

        .player-card.empty {
          border-style: dashed;
          opacity: 0.5;
        }

        .player-character {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .player-name {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .player-status {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .player-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #C2730A;
          color: white;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }

        .character-section h3 {
          color: white;
          font-size: 18px;
          margin-bottom: 15px;
          text-align: center;
        }

        .character-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .character-button {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .character-button:hover {
          border-color: #C2730A;
          background: rgba(194, 115, 10, 0.2);
        }

        .character-button.selected {
          border-color: #C2730A;
          background: rgba(194, 115, 10, 0.3);
        }

        .character-emoji {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .character-name {
          font-size: 12px;
          font-weight: 600;
        }

        .controls-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .ready-button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .ready-button.ready {
          background: #4CAF50;
          border-color: #4CAF50;
        }

        .ready-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .start-button {
          background: linear-gradient(45deg, #4CAF50, #45a049);
          border: none;
          color: white;
          padding: 15px 40px;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .start-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #5CBF60, #4CAF50);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
        }

        .leave-button {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .leave-button:hover {
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.2);
        }

        .error-message {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.5);
          color: #ff6b6b;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-message button {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .lobby-container {
            padding: 20px;
          }

          .players-grid {
            grid-template-columns: 1fr;
          }

          .character-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .session-code-container {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Lobby;