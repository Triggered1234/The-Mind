import Session from '../models/Session.js';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req, res) => {
    try {
        const { player_id, max_players = 4 } = req.query;
        const session = new Session({ session_id: uuidv4(), max_players, players: [player_id], status: 'waiting' });
        await session.save();
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Error creating session' });
    }
};

export const joinSession = async (req, res) => {
    try {
        const { session_id, player_id, nickname } = req.body;
        const session = await Session.findOne({ session_id });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        if (session.players.length >= session.max_players) return res.status(400).json({ error: 'Session is full' });
        
        session.players.push(player_id);
        await session.save();
        res.status(200).json({ session_id, player_id, nickname });
    } catch (error) {
        res.status(500).json({ error: 'Error joining session' });
    }
};
