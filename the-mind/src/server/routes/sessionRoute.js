// routes/sessionRoute.js
import express from 'express';

export const createSessionRouter = (sessionController, gameController) => {
  const router = express.Router();

  // Session Management Routes
  router.post('/', sessionController.createSession);                    // POST /api/sessions
  router.get('/:sessionId', sessionController.getSession);             // GET /api/sessions/:sessionId
  
  // Player Management Routes  
  router.post('/:sessionId/players', sessionController.joinSession);   // POST /api/sessions/:sessionId/players
  router.get('/:sessionId/players', sessionController.getPlayers);     // GET /api/sessions/:sessionId/players
  router.delete('/:sessionId/players', sessionController.leaveSession); // DELETE /api/sessions/:sessionId/players
  
  // Character & Ready State Routes
  router.post('/:sessionId/characters', sessionController.chooseCharacter); // POST /api/sessions/:sessionId/characters
  router.patch('/:sessionId/ready', sessionController.toggleReady);      // PATCH /api/sessions/:sessionId/ready
  
  // Game Flow Routes
  router.post('/:sessionId/start', sessionController.startGame);        // POST /api/sessions/:sessionId/start
  router.post('/:sessionId/replay', sessionController.replayGame);      // POST /api/sessions/:sessionId/replay
  
  // Game State Routes
  router.get('/:sessionId/state', gameController.getGameState);         // GET /api/sessions/:sessionId/state
  router.post('/:sessionId/level/start', gameController.startLevel);    // POST /api/sessions/:sessionId/level/start
  
  // Card Playing Routes
  router.post('/:sessionId/cards', gameController.playCard);            // POST /api/sessions/:sessionId/cards
  router.get('/:sessionId/cards', gameController.getCardsPlayed);       // GET /api/sessions/:sessionId/cards
  
  // Special Actions Routes
  router.post('/:sessionId/shuriken', gameController.useShuriken);      // POST /api/sessions/:sessionId/shuriken
  
  // Debug Routes (optional - for development)
  router.get('/:sessionId/players/:playerId/hand', gameController.getPlayerHand); // GET /api/sessions/:sessionId/players/:playerId/hand

  return router;
};