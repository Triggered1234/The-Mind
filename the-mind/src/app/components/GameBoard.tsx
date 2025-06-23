// src/app/components/GameBoard.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const GameBoard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { 
    playerId, 
    nickname, 
    gameState,
    session,
    startLevel,
    playCard, 
    useShuriken,
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
      navigate('/setup');
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

  const handleCardClick = (card: number) => {
    if (selectedCard === card) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handlePlayCard = () => {
    if (selectedCard === null) return;
    
    setShowConfirmation(true);
  };

  const confirmPlayCard = async () => {
    if (selectedCard === null) return;

    try {
      await playCard(selectedCard);
      setSelectedCard(null);
      setShowConfirmation(false);
    } catch (err) {
      console.error('Failed to play card:', err);
    }
  };

  const handleUseShuriken = async () => {
    if (!gameState || gameState.shurikens <= 0) return;

    try {
      await useShuriken();
    } catch (err) {
      console.error('Failed to use shuriken:', err);
    }
  };

  const handleStartLevel = async () => {
    try {
      await startLevel();
    } catch (err) {
      console.error('Failed to start level:', err);
    }
  };

  const handleReplayGame = async () => {
    try {
      await replayGame();
      navigate(`/lobby/${sessionId}`);
    } catch (err) {
      console.error('Failed to replay game:', err);
    }
  };

  const handleLeaveGame = () => {
    navigate('/create');
  };

  if (!gameState || !session) {
    return (
      <div className="game-board loading">
        <div className="loading-message">Se încarcă jocul...</div>
      </div>
    );
  }

  const myHand = gameState.my_hand || [];
  const cardsPlayed = gameState.cards_played || [];
  const lastPlayedCard = cardsPlayed.length > 0 ? cardsPlayed[cardsPlayed.length - 1] : null;
  const nextExpectedCard = gameState.next_expected_card;

  return (
    <div className="game-board">
      <div className="game-container">
        {/* Game Header */}
        <div className="game-header">
          <div className="game-info">
            <div className="level-info">
              <span className="level">Nivel {gameState.level}</span>
              <div className="stats">
                <span className="lives">❤️ {gameState.lives}</span>
                <span className="shurikens">⭐ {gameState.shurikens}</span>
              </div>
            </div>
          </div>
          
          <button className="leave-button" onClick={handleLeaveGame}>
            🚪 Ieși
          </button>
        </div>

        {/* Game Message */}
        {gameMessage && (
          <div className="game-message">
            {gameMessage}
          </div>
        )}

        {/* Game Status */}
        {gameState.status === 'started' && (
          <div className="level-start">
            <h2>Gata să începeți Nivelul {gameState.level}?</h2>
            <p>Fiecare jucător va primi {gameState.level} {gameState.level === 1 ? 'carte' : 'cărți'}.</p>
            <button className="start-level-button" onClick={handleStartLevel}>
              🎯 Începe Nivelul
            </button>
          </div>
        )}

        {gameState.status === 'playing' && (
          <>
            {/* Players Overview */}
            <div className="players-overview">
              {gameState.players.map(player => (
                <div 
                  key={player.player_id} 
                  className={`player-overview ${player.player_id === playerId ? 'me' : ''}`}
                >
                  <div className="player-name">{player.nickname}</div>
                  <div className="cards-count">
                    {Array.from({ length: player.cards_remaining || 0 }).map((_, i) => (
                      <span key={i} className="card-back">🂠</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Cards Played */}
            <div className="cards-played-section">
              <h3>Cărți Jucate</h3>
              <div className="cards-played">
                {cardsPlayed.length === 0 ? (
                  <div className="no-cards">Încă nu s-au jucat cărți</div>
                ) : (
                  cardsPlayed.map((cardPlay, index) => (
                    <div key={index} className="played-card">
                      <div className="card-number">{cardPlay.card}</div>
                      <div className="card-player">{cardPlay.player_id === playerId ? 'Tu' : 
                        gameState.players.find(p => p.player_id === cardPlay.player_id)?.nickname}</div>
                    </div>
                  ))
                )}
              </div>
              
              {nextExpectedCard && (
                <div className="next-expected">
                  Următoarea carte așteptată: <strong>{nextExpectedCard}</strong>
                </div>
              )}
            </div>

            {/* My Hand */}
            <div className="my-hand-section">
              <h3>Mâna Ta</h3>
              <div className="my-hand">
                {myHand.map(card => (
                  <button
                    key={card}
                    className={`hand-card ${selectedCard === card ? 'selected' : ''} ${
                      nextExpectedCard && card < nextExpectedCard ? 'invalid' : ''
                    }`}
                    onClick={() => handleCardClick(card)}
                  >
                    {card}
                  </button>
                ))}
              </div>
              
              {myHand.length === 0 && (
                <div className="empty-hand">Ai jucat toate cărțile! 🎉</div>
              )}
            </div>

            {/* Game Actions */}
            <div className="game-actions">
              {selectedCard !== null && (
                <button 
                  className="play-card-button"
                  onClick={handlePlayCard}
                  disabled={isLoading}
                >
                  🃏 Joacă Cartea {selectedCard}
                </button>
              )}
              
              {gameState.shurikens > 0 && (
                <button 
                  className="shuriken-button"
                  onClick={handleUseShuriken}
                  disabled={isLoading}
                >
                  ⭐ Folosește Shuriken ({gameState.shurikens})
                </button>
              )}
            </div>
          </>
        )}

        {/* Level Complete */}
        {gameState.status === 'level_complete' && (
          <div className="level-complete">
            <h2>🎉 Nivel Completat!</h2>
            <p>Felicitări! Ați trecut la nivelul {gameState.level}.</p>
            <button className="continue-button" onClick={handleStartLevel}>
              Continuă la Nivelul {gameState.level}
            </button>
          </div>
        )}

        {/* Game Over */}
        {(gameState.status === 'game_over' || gameState.status === 'completed') && (
          <div className="game-over">
            <h2>
              {gameState.status === 'completed' ? '🏆 Victorie!' : '💀 Joc Terminat'}
            </h2>
            <p>
              {gameState.status === 'completed' 
                ? 'Ați completat cu succes toate nivelurile!' 
                : `Ați ajuns până la nivelul ${gameState.level}.`
              }
            </p>
            <div className="game-over-actions">
              <button className="replay-button" onClick={handleReplayGame}>
                🔄 Joacă Din Nou
              </button>
              <button className="leave-button-final" onClick={handleLeaveGame}>
                🚪 Ieși din Joc
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && selectedCard !== null && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <h3>Confirmă Jucarea Cărții</h3>
              <p>Sigur vrei să joci cartea <strong>{selectedCard}</strong>?</p>
              {lastPlayedCard && (
                <p className="last-card">Ultima carte jucată: {lastPlayedCard.card}</p>
              )}
              <div className="modal-actions">
                <button 
                  className="confirm-button"
                  onClick={confirmPlayCard}
                  disabled={isLoading}
                >
                  ✅ Da, Joacă
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => setShowConfirmation(false)}
                >
                  ❌ Anulează
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError}>✕</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .game-board {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          padding: 20px;
        }

        .game-board.loading {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-message {
          color: white;
          font-size: 24px;
          text-align: center;
        }

        .game-container {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .level-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .level {
          color: white;
          font-size: 28px;
          font-weight: 800;
        }

        .stats {
          display: flex;
          gap: 15px;
        }

        .lives, .shurikens {
          color: white;
          font-size: 18px;
          font-weight: 600;
        }

        .leave-button {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .leave-button:hover {
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.2);
        }

        .game-message {
          background: linear-gradient(45deg, #C2730A, #824728);
          color: white;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .level-start, .level-complete, .game-over {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          margin-bottom: 20px;
        }

        .level-start h2, .level-complete h2, .game-over h2 {
          color: white;
          font-size: 24px;
          margin-bottom: 15px;
        }

        .level-start p, .level-complete p, .game-over p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin-bottom: 25px;
        }

        .start-level-button, .continue-button, .replay-button {
          background: linear-gradient(45deg, #4CAF50, #45a049);
          border: none;
          color: white;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .start-level-button:hover, .continue-button:hover, .replay-button:hover {
          background: linear-gradient(45deg, #5CBF60, #4CAF50);
          transform: translateY(-2px);
        }

        .players-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .player-overview {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
        }

        .player-overview.me {
          border: 2px solid #C2730A;
        }

        .player-name {
          color: white;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .cards-count {
          display: flex;
          justify-content: center;
          gap: 3px;
          flex-wrap: wrap;
        }

        .card-back {
          font-size: 20px;
        }

        .cards-played-section, .my-hand-section {
          margin-bottom: 30px;
        }

        .cards-played-section h3, .my-hand-section h3 {
          color: white;
          font-size: 20px;
          margin-bottom: 15px;
          text-align: center;
        }

        .cards-played {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
          min-height: 80px;
          align-items: center;
        }

        .no-cards {
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
          text-align: center;
        }

        .played-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          min-width: 60px;
        }

        .card-number {
          font-size: 20px;
          font-weight: 800;
          color: #333;
        }

        .card-player {
          font-size: 10px;
          color: #666;
          margin-top: 2px;
        }

        .next-expected {
          text-align: center;
          color: #C2730A;
          font-weight: 600;
          font-size: 16px;
        }

        .my-hand {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .hand-card {
          background: rgba(255, 255, 255, 0.9);
          border: 3px solid transparent;
          border-radius: 10px;
          padding: 15px;
          font-size: 24px;
          font-weight: 800;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 80px;
        }

        .hand-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(255, 255, 255, 0.3);
        }

        .hand-card.selected {
          border-color: #C2730A;
          background: rgba(194, 115, 10, 0.2);
          color: white;
        }

        .hand-card.invalid {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-hand {
          text-align: center;
          color: #4CAF50;
          font-size: 18px;
          font-weight: 600;
        }

        .game-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .play-card-button {
          background: linear-gradient(45deg, #C2730A, #824728);
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .play-card-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #D68A0B, #A05832);
          transform: translateY(-2px);
        }

        .shuriken-button {
          background: linear-gradient(45deg, #9C27B0, #7B1FA2);
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .shuriken-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #AB47BC, #8E24AA);
          transform: translateY(-2px);
        }

        .game-over-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .leave-button-final {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.5);
          color: white;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .leave-button-final:hover {
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.2);
        }

        .confirmation-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          max-width: 400px;
          width: 90%;
        }

        .modal-content h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .modal-content p {
          margin-bottom: 10px;
          color: #666;
        }

        .last-card {
          color: #C2730A;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .confirm-button {
          background: #4CAF50;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-button {
          background: #f44336;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
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
          .game-container {
            padding: 20px;
          }

          .players-overview {
            grid-template-columns: 1fr;
          }

          .my-hand {
            gap: 5px;
          }

          .hand-card {
            min-width: 60px;
            padding: 12px;
            font-size: 20px;
          }

          .game-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GameBoard;