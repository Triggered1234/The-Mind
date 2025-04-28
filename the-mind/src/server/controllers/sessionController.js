import Session from '../models/Session.js';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req, res) => {
    try {
        const { player_id, max_players = 4 } = req.query;
        const session = new Session({
            session_id: uuidv4(),
            max_players,
            players: [player_id],
            status: 'waiting'
        });
        await session.save();
        res.status(200).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating session' });
    }
};

export const joinSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { player_id, nickname } = req.body;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        if (session.players.length >= session.max_players) {
            return res.status(400).json({ error: 'Session is full' });
        }

        session.players.push(player_id);
        await session.save();

        res.status(200).json({ session_id: sessionId, player_id, nickname });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error joining session' });
    }
};

export const requestShuriken = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { player_id } = req.body;

        res.status(200).json({ status: `Player ${player_id} requested to use a shuriken.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error requesting shuriken' });
    }
};

export const moveToNextLevel = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        session.level = (session.level || 1) + 1;
        await session.save();

        res.status(200).json({ status: `Moved to level ${session.level}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error moving to next level' });
    }
};

export const playCard = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { player_id, card } = req.body;

        res.status(200).json({ status: `Player ${player_id} played card ${card}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error playing card' });
    }
};

export const chooseCharacter = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { player_id, character_id } = req.body;

        res.status(200).json({
            session_id: sessionId,
            player_id,
            character_id,
            status: 'Character chosen'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error choosing character' });
    }
};

export const startGame = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        session.status = 'started';
        await session.save();

        res.status(200).json({ status: 'Game started' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error starting game' });
    }
};

export const replayGame = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        session.level = 1;
        session.status = 'waiting';
        await session.save();

        res.status(200).json({ status: 'Game restarted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error restarting game' });
    }
};
