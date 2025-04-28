import express from 'express';
import {
  createSession,
  joinSession,
  requestShuriken,
  moveToNextLevel,
  playCard,
  chooseCharacter,
  startGame,
  replayGame
} from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', createSession);
router.post('/:sessionId/players', joinSession);
router.post('/:sessionId/shuriken-requests', requestShuriken);
router.patch('/:sessionId/level', moveToNextLevel);
router.post('/:sessionId/cards', playCard);
router.post('/:sessionId/characters', chooseCharacter);
router.post('/:sessionId/start', startGame);
router.post('/:sessionId/replay', replayGame);

export default router;
