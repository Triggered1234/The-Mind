// src/app/components/Lobby.tsx
import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../services/api';
import './styles/Lobby.css';

const CHARACTERS = [
  { id: 'ninja', name: 'Ninja', emoji: '🥷' },
  { id: 'samurai', name: 'Samurai', emoji: '🗾' },
  { id: 'monk', name: 'Călugăr', emoji: '🧘‍♂️' },
  { id: 'warrior', name: 'Războinic', emoji: '⚔️' },
];

interface LobbyProps {
  sessionId?: string;
  navigate: (page: string, sessionId?: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ sessionId: propSessionId, navigate }) => {
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
  const [isJoiningSession, setIsJoiningSession] = useState(false);

  // Use either prop or URL param for session ID
  const sessionId = propSessionId;

  useEffect(() => {
    if (!sessionId) {
      navigate('create');
      return;
    }

    if (!playerId || !nickname) {
      navigate('setup');
      return;
    }

    // If we don't have session data, try to join
    if (!session || session.session_id !== sessionId) {
      setIsJoiningSession(true);
      joinSession(sessionId).finally(() => {
        setIsJoiningSession(false);
      });
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
      navigate('game', sessionId);
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
      navigate('create');
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

  if (isJoiningSession || !session) {
    return (
      <div className="lobby loading">
        <div className="loading-message">
          {isJoiningSession ? 'Se alătură la sesiune...' : 'Se încarcă sesiunea...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lobby error">
        <div className="error-container">
          <h2>❌ Eroare</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={clearError}>Încearcă din nou</button>
            <button onClick={() => navigate('create')}>Înapoi la meniu</button>
          </div>
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
          <button className="leave-button" onClick={handleLeaveSession}>
            🚪 Părăsește Sesiunea
          </button>
        </div>

        <div className="lobby-content">
          {/* Players List */}
          <div className="players-section">
            <h2>👥 Jucători ({session.players.length}/{session.max_players})</h2>
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
                    {player.is_ready ? '✅ Gata' : '⏳ Se pregătește'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="controls-section">
            <h3>🎮 Controale</h3>
            
            {/* Character Selection */}
            <div className="character-selection">
              <h4>Alege Caracterul:</h4>
              <div className="character-grid">
                {CHARACTERS.map((character) => (
                  <div
                    key={character.id}
                    className={`character-option ${selectedCharacter === character.id ? 'selected' : ''}`}
                    onClick={() => handleCharacterSelect(character.id)}
                  >
                    <span className="character-emoji">{character.emoji}</span>
                    <div>{character.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready Controls */}
            <div className="ready-controls">
              <button 
                className={`ready-button ${isReady ? 'ready' : 'not-ready'}`}
                onClick={handleToggleReady}
                disabled={isLoading}
              >
                {isReady ? '✅ Gata de joc!' : '🚀 Marchează ca gata'}
              </button>
              
              {allPlayersReady && session.players.length >= 2 && (
                <button 
                  className="start-game-button"
                  onClick={handleStartGame}
                  disabled={!canStartGame || isLoading}
                >
                  🎯 Începe Jocul
                </button>
              )}
              
              {!allPlayersReady && (
                <div className="start-game-hint">
                  {session.players.length < 2 
                    ? 'Se așteaptă mai mulți jucători...' 
                    : 'Se așteaptă ca toți jucătorii să fie gata...'
                  }
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="game-info">
              <h4>📊 Informații Sesiune</h4>
              <ul>
                <li>Status: <strong>{session.status === 'waiting' ? 'Se așteaptă jucători' : session.status}</strong></li>
                <li>Nivel: <strong>{session.level}</strong></li>
                <li>Vieți: <strong>{session.lives}</strong></li>
                <li>Shuriken: <strong>{session.shurikens}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;