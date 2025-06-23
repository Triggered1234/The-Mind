// src/app/components/GameBoard.tsx
import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import './styles/GameBoard.css';

interface GameBoardProps {
  sessionId?: string;
  navigate: (page: string, sessionId?: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ sessionId, navigate }) => {
  const { 
    playerId, 
    nickname, 
    gameState,
    session,
    startLevel,
    playCard, 
    initiateShurikenVote,
    castShurikenVote,
    replayGame,
    refreshGameState,
    startPolling,
    stopPolling,
    isLoading, 
    error,
    clearError 
  } = useGame();

  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [gameMessage, setGameMessage] = useState('');

  useEffect(() => {
    if (!sessionId || !playerId || !nickname) {
      navigate('setup');
      return;
    }

    // Start polling for real-time updates
    startPolling();
    refreshGameState();

    return () => {
      stopPolling();
    };
  }, [sessionId, playerId, nickname]);

  // Handle game state changes
  useEffect(() => {
    if (!gameState) return;

    // Show appropriate message based on game state
    if (gameState.status === 'level_complete') {
      setGameMessage(`🎉 Nivel ${gameState.level - 1} Completat!`);
    } else if (gameState.status === 'game_over') {
      setGameMessage('💀 Joc Terminat - Ați rămas fără vieți');
    } else if (gameState.status === 'completed') {
      setGameMessage('🏆 Felicitări! Ați câștigat jocul!');
    } else if (gameState.status === 'playing') {
      setGameMessage('');
    }
  }, [gameState?.status]);

  const handleCardSelect = (card: number) => {
    if (selectedCard === card) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handlePlayCard = async () => {
    if (selectedCard === null) return;

    try {
      await playCard(selectedCard);
      setSelectedCard(null);
      setGameMessage('');
    } catch (err) {
      console.error('Error playing card:', err);
    }
  };

const handleInitiateShurikenVote = async () => {
  if (!gameState || gameState.shurikens <= 0) return;

  try {
    await initiateShurikenVote();
    setGameMessage('🗡️ Votare shuriken inițiată!');
  } catch (err) {
    console.error('Error initiating shuriken vote:', err);
  }
};

const handleCastShurikenVote = async (vote: boolean) => {
  try {
    await castShurikenVote(vote);
    setGameMessage(vote ? '✅ Ai votat DA pentru shuriken' : '❌ Ai votat NU pentru shuriken');
  } catch (err) {
    console.error('Error casting shuriken vote:', err);
  }
};

  const handleUseShuriken = async () => {
    if (!gameState || gameState.shurikens <= 0) return;

    try {
      await useShuriken();
      setGameMessage('🗡️ Shuriken folosit!');
    } catch (err) {
      console.error('Error using shuriken:', err);
    }
  };

  const handleStartLevel = async () => {
    try {
      await startLevel();
      setGameMessage('');
    } catch (err) {
      console.error('Error starting level:', err);
    }
  };

  const handleReplayGame = async () => {
    try {
      await replayGame();
      // Navigate back to lobby instead of staying on game board
      navigate('lobby', sessionId);
    } catch (err) {
      console.error('Error replaying game:', err);
    }
  };

  const handleLeaveGame = () => {
    stopPolling();
    navigate('create');
  };

  // Loading state
  if (!gameState && !error) {
    return (
      <div className="game-board loading">
        <div className="loading-message">Se încarcă jocul...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="game-board error">
        <div className="error-container">
          <h2>❌ Eroare</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={clearError}>Încearcă din nou</button>
            <button onClick={handleLeaveGame}>Înapoi la meniu</button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="game-board">
        <div className="game-container">
          <div className="game-header">
            <h1>Se pregătește jocul...</h1>
            <button className="leave-button" onClick={handleLeaveGame}>
              🚪 Părăsește Jocul
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level not started yet
  if (gameState.status === 'waiting' || gameState.status === 'started') {
    return (
      <div className="game-board">
        <div className="game-container">
          <div className="game-header">
            <div className="level-info">
              <div className="level">Nivel {gameState.level}</div>
              <div className="stats">
                <div className="lives">❤️ {gameState.lives}</div>
                <div className="shurikens">🗡️ {gameState.shurikens}</div>
              </div>
            </div>
            <button className="leave-button" onClick={handleLeaveGame}>
              🚪 Părăsește Jocul
            </button>
          </div>

          <div className="level-start">
            <h2>🎯 Nivel {gameState.level}</h2>
            <p>
              Fiecare jucător va primi {gameState.level} carte{gameState.level > 1 ? 's' : ''}.
              Jucați-le în ordine crescătoare fără a comunica!
            </p>
            <button 
              className="start-level-button" 
              onClick={handleStartLevel}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Se pornește...' : '🚀 Pornește Nivelul'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level complete
  if (gameState.status === 'level_complete') {
    return (
      <div className="game-board">
        <div className="game-container">
          <div className="game-header">
            <div className="level-info">
              <div className="level">Nivel {gameState.level} Completat!</div>
              <div className="stats">
                <div className="lives">❤️ {gameState.lives}</div>
                <div className="shurikens">🗡️ {gameState.shurikens}</div>
              </div>
            </div>
            <button className="leave-button" onClick={handleLeaveGame}>
              🚪 Părăsește Jocul
            </button>
          </div>

          <div className="level-complete">
            <h2>🎉 Felicitări!</h2>
            <p>
              Ați completat nivelul {gameState.level - 1}! 
              Sunteți gata pentru următorul nivel?
            </p>
            <button 
              className="continue-button" 
              onClick={handleStartLevel}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Se pregătește...' : '➡️ Continuă la Nivelul ' + gameState.level}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game over
  if (gameState.status === 'game_over' || gameState.is_game_over) {
    return (
      <div className="game-board">
        <div className="game-container">
          <div className="game-header">
            <div className="level-info">
              <div className="level">Joc Terminat</div>
              <div className="stats">
                <div className="lives">❤️ {gameState.lives}</div>
                <div className="shurikens">🗡️ {gameState.shurikens}</div>
              </div>
            </div>
            <button className="leave-button" onClick={handleLeaveGame}>
              🚪 Părăsește Jocul
            </button>
          </div>

          <div className="game-over">
            <h2>💀 Joc Terminat</h2>
            <p>
              Ați ajuns până la nivelul {gameState.level}. 
              Vreți să încercați din nou?
            </p>
            <div className="game-over-actions">
              <button 
                className="replay-button" 
                onClick={handleReplayGame}
                disabled={isLoading}
              >
                {isLoading ? '🔄 Se resetează...' : '🔄 Joacă Din Nou'}
              </button>
              <button className="leave-button-final" onClick={handleLeaveGame}>
                🏠 Înapoi la Meniu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game completed
  if (gameState.status === 'completed') {
    return (
      <div className="game-board">
        <div className="game-container">
          <div className="game-header">
            <div className="level-info">
              <div className="level">Victorie!</div>
              <div className="stats">
                <div className="lives">❤️ {gameState.lives}</div>
                <div className="shurikens">🗡️ {gameState.shurikens}</div>
              </div>
            </div>
            <button className="leave-button" onClick={handleLeaveGame}>
              🚪 Părăsește Jocul
            </button>
          </div>

          <div className="level-complete">
            <h2>🏆 Felicitări!</h2>
            <p>
              Ați câștigat jocul! Ați completat toate nivelurile cu succes!
            </p>
            <div className="game-over-actions">
              <button 
                className="replay-button" 
                onClick={handleReplayGame}
                disabled={isLoading}
              >
                {isLoading ? '🔄 Se resetează...' : '🔄 Joacă Din Nou'}
              </button>
              <button className="leave-button-final" onClick={handleLeaveGame}>
                🏠 Înapoi la Meniu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active gameplay
  const nextExpectedCard = gameState.next_expected_card;
  const canPlayCard = (card: number) => {
    if (!nextExpectedCard) return true;
    return card >= nextExpectedCard;
  };

  return (
    <div className="game-board">
      <div className="game-container">
        <div className="game-header">
          <div className="level-info">
            <div className="level">Nivel {gameState.level}</div>
            <div className="stats">
              <div className="lives">❤️ {gameState.lives}</div>
              <div className="shurikens">🗡️ {gameState.shurikens}</div>
            </div>
          </div>
          <button className="leave-button" onClick={handleLeaveGame}>
            🚪 Părăsește Jocul
          </button>
        </div>

        {gameMessage && (
          <div className="game-message">
            {gameMessage}
          </div>
        )}

        <div className="game-content">
          {/* Cards Played */}
          <div className="cards-played-section">
            <h3>🃏 Cărți Jucate</h3>
            <div className="cards-played">
              {gameState.cards_played && gameState.cards_played.length > 0 ? (
                gameState.cards_played.map((cardPlay, index) => (
                  <div key={index} className="played-card">
                    {cardPlay.card}
                  </div>
                ))
              ) : (
                <div className="no-cards">Nicio carte jucată încă</div>
              )}
            </div>
          </div>

          {/* Player's Hand */}
          <div className="player-hand-section">
            <h3>🎴 Cartea Ta</h3>
            <div className="player-hand">
              {gameState.my_hand && gameState.my_hand.length > 0 ? (
                gameState.my_hand.map((card) => (
                  <div
                    key={card}
                    className={`hand-card ${selectedCard === card ? 'selected' : ''} ${!canPlayCard(card) ? 'invalid' : ''}`}
                    onClick={() => canPlayCard(card) && handleCardSelect(card)}
                  >
                    {card}
                  </div>
                ))
              ) : (
                <div className="empty-hand">
                  🎉 Toate cărțile jucate!
                </div>
              )}
            </div>
          </div>

          {/* Game Actions */}
          {gameState.my_hand && gameState.my_hand.length > 0 && (
            <div className="game-actions">
              <button 
                className="play-card-button"
                onClick={handlePlayCard}
                disabled={selectedCard === null || !canPlayCard(selectedCard) || isLoading}
              >
                {isLoading ? '🔄 Se joacă...' : selectedCard ? `🎯 Joacă ${selectedCard}` : '🎯 Selectează o carte'}
              </button>
              
              {/* Shuriken Voting Interface */}
              {gameState.shurikens > 0 && (
                <div className="shuriken-controls">
                  {gameState.shuriken_voting?.active ? (
                    <div className="shuriken-voting">
                      <div className="voting-status">
                        <h4>🗡️ Votare Shuriken în Curs</h4>
                        <p>
                          Voturi: {gameState.shuriken_voting.votes.length} / {gameState.shuriken_voting.votes_needed}
                        </p>
                        <p>Inițiat de: {gameState.players.find(p => p.player_id === gameState.shuriken_voting?.initiated_by)?.nickname}</p>
                      </div>
                      
                      {!gameState.shuriken_voting.votes.includes(playerId || '') && (
                        <div className="vote-buttons">
                          <button 
                            className="vote-yes-button"
                            onClick={() => handleCastShurikenVote(true)}
                            disabled={isLoading}
                          >
                            ✅ DA
                          </button>
                          <button 
                            className="vote-no-button"
                            onClick={() => handleCastShurikenVote(false)}
                            disabled={isLoading}
                          >
                            ❌ NU
                          </button>
                        </div>
                      )}
                      
                      {gameState.shuriken_voting.votes.includes(playerId || '') && (
                        <div className="already-voted">
                          ✅ Ai votat deja
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      className="shuriken-button"
                      onClick={handleInitiateShurikenVote}
                      disabled={isLoading}
                    >
                      🗡️ Propune Shuriken ({gameState.shurikens})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Players Overview */}
          <div className="players-overview">
            <h3>👥 Jucători</h3>
            <div className="players-grid">
              {gameState.players.map((player) => (
                <div 
                  key={player.player_id} 
                  className={`player-info ${player.player_id === playerId ? 'me' : ''}`}
                >
                  <div className="player-name">{player.nickname}</div>
                  <div className="cards-remaining">
                    {player.cards_remaining || 0} carte{(player.cards_remaining || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <h3>Confirmă acțiunea</h3>
              <p>Sigur vrei să joci cartea {selectedCard}?</p>
              <div className="modal-actions">
                <button onClick={() => setShowConfirmation(false)}>Anulează</button>
                <button onClick={() => { handlePlayCard(); setShowConfirmation(false); }}>
                  Confirmă
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;