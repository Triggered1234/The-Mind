import Game from '../models/Game.js';

export const requestShuriken = async (req, res) => {
    try {
        const { session_id, player_id } = req.query;
        res.status(200).json({ status: 'Shuriken request received' });
    } catch (error) {
        res.status(500).json({ error: 'Error requesting shuriken' });
    }
};

export const nextLevel = async (req, res) => {
    try {
        const { session_id } = req.query;
        res.status(200).json({ status: 'Next level started' });
    } catch (error) {
        res.status(500).json({ error: 'Error moving to next level' });
    }
};

export const playCard = async (req, res) => {
    try {
        const { session_id, player_id, card } = req.body;
        const game = new Game({ session_id, player_id, cards: card });
        await game.save();
        res.status(200).json({ status: 'Card played successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error playing card' });
    }
};

export const chooseCharacter = async (req, res) => {
    try {
        const { session_id, player_id, character_id } = req.body;
        res.status(200).json({ session_id, player_id, character_id, status: 'Character chosen' });
    } catch (error) {
        res.status(500).json({ error: 'Error choosing character' });
    }
};

export const startGame = async (req, res) => {
    try {
        const { session_id } = req.body;
        res.status(200).json({ status: 'Game started' });
    } catch (error) {
        res.status(500).json({ error: 'Error starting game' });
    }
};

export const replayGame = async (req, res) => {
    try {
        const { session_id } = req.body;
        res.status(200).json({ status: 'Game restarted' });
    } catch (error) {
        res.status(500).json({ error: 'Error replaying game' });
    }
};
