import express from 'express';
import { requestShuriken, nextLevel, playCard, chooseCharacter, startGame, replayGame } from '../controllers/gameController.js';

const router = express.Router();

router.get('/request-shuriken', requestShuriken);
router.get('/next-level', nextLevel);
router.post('/play-card', playCard);
router.post('/choose-character', chooseCharacter);
router.post('/start', startGame);
router.post('/replay', replayGame);

export default router;
