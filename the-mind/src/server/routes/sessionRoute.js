// routes/sessionRoutes.js
import express from 'express';

export const createSessionRouter = (controller) => {
  const router = express.Router();

  router.post('/', controller.createSession);
  router.post('/:sessionId/players', controller.joinSession);
  router.post('/:sessionId/shuriken-requests', controller.requestShuriken);
  router.patch('/:sessionId/level', controller.moveToNextLevel);
  router.post('/:sessionId/cards', controller.playCard);
  router.post('/:sessionId/characters', controller.chooseCharacter);
  router.post('/:sessionId/start', controller.startGame);
  router.post('/:sessionId/replay', controller.replayGame);

  return router;
};
