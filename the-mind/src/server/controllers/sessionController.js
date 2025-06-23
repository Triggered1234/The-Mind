// controllers/sessionController.js

export const createSessionController = (deps) => {
  const { Session, uuidv4 } = deps;

  return {
    createSession: async (req, res) => {
      try {
        const { player_id, nickname, max_players = 4 } = req.query;
        
        if (!player_id || !nickname) {
          return res.status(400).json({ error: 'player_id and nickname are required' });
        }

        const session = new Session({
          session_id: uuidv4(),
          max_players: parseInt(max_players),
          players: [{
            player_id,
            nickname,
            hand: [],
            is_ready: false
          }],
          status: 'waiting',
          level: 1,
          lives: 3,
          shurikens: 1
        });
        
        await session.save();
        
        res.status(200).json({
          session_id: session.session_id,
          max_players: session.max_players,
          players: session.players.map(p => ({
            player_id: p.player_id,
            nickname: p.nickname,
            is_ready: p.is_ready
          })),
          status: session.status
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating session' });
      }
    },

    getSession: async (req, res) => {
      try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json({
          session_id: session.session_id,
          max_players: session.max_players,
          status: session.status,
          level: session.level,
          lives: session.lives,
          shurikens: session.shurikens,
          players: session.players.map(p => ({
            player_id: p.player_id,
            nickname: p.nickname,
            character_id: p.character_id,
            is_ready: p.is_ready,
            cards_remaining: p.hand ? p.hand.length : 0
          })),
          cards_played_count: session.cards_played ? session.cards_played.length : 0
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving session' });
      }
    },

    joinSession: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id, nickname } = req.body;

        if (!player_id || !nickname) {
          return res.status(400).json({ error: 'player_id and nickname are required' });
        }

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'waiting') {
          return res.status(400).json({ error: 'Session has already started' });
        }

        if (session.players.length >= session.max_players) {
          return res.status(400).json({ error: 'Session is full' });
        }

        // Check if player already in session
        const existingPlayer = session.players.find(p => p.player_id === player_id);
        if (existingPlayer) {
          return res.status(400).json({ error: 'Player already in session' });
        }

        session.players.push({
          player_id,
          nickname,
          hand: [],
          is_ready: false
        });
        
        await session.save();

        res.status(200).json({
          session_id: sessionId,
          player_id,
          nickname,
          players: session.players.map(p => ({
            player_id: p.player_id,
            nickname: p.nickname,
            is_ready: p.is_ready
          }))
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error joining session' });
      }
    },

    getPlayers: async (req, res) => {
      try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json({
          players: session.players.map(p => ({
            player_id: p.player_id,
            nickname: p.nickname,
            character_id: p.character_id,
            is_ready: p.is_ready,
            cards_remaining: p.hand ? p.hand.length : 0
          }))
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving players' });
      }
    },

    chooseCharacter: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id, character_id } = req.body;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const player = session.players.find(p => p.player_id === player_id);
        if (!player) {
          return res.status(404).json({ error: 'Player not found in session' });
        }

        player.character_id = character_id;
        await session.save();

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
    },

    toggleReady: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id } = req.body;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const player = session.players.find(p => p.player_id === player_id);
        if (!player) {
          return res.status(404).json({ error: 'Player not found in session' });
        }

        player.is_ready = !player.is_ready;
        await session.save();

        res.status(200).json({
          session_id: sessionId,
          player_id,
          is_ready: player.is_ready,
          all_ready: session.players.every(p => p.is_ready)
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error toggling ready state' });
      }
    },

    startGame: async (req, res) => {
      try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'waiting') {
          return res.status(400).json({ error: 'Game has already started' });
        }

        if (session.players.length < 2) {
          return res.status(400).json({ error: 'Need at least 2 players to start' });
        }

        // Check if all players are ready
        const allReady = session.players.every(p => p.is_ready);
        if (!allReady) {
          return res.status(400).json({ error: 'All players must be ready to start' });
        }

        session.status = 'started';
        session.level = 1;
        session.lives = 3;
        session.shurikens = 1;
        
        await session.save();

        res.status(200).json({
          status: 'Game started',
          level: session.level,
          lives: session.lives,
          shurikens: session.shurikens
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error starting game' });
      }
    },

    replayGame: async (req, res) => {
      try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        // Reset game state
        session.level = 1;
        session.lives = 3;
        session.shurikens = 1;
        session.status = 'waiting';
        session.cards_played = [];
        session.deck = [];
        
        // Clear all player hands and reset ready states
        session.players.forEach(player => {
          player.hand = [];
          player.is_ready = false;
        });

        await session.save();

        res.status(200).json({
          status: 'Game restarted',
          level: session.level,
          lives: session.lives,
          shurikens: session.shurikens
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error restarting game' });
      }
    },

    leaveSession: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id } = req.body;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const playerIndex = session.players.findIndex(p => p.player_id === player_id);
        if (playerIndex === -1) {
          return res.status(404).json({ error: 'Player not found in session' });
        }

        session.players.splice(playerIndex, 1);
        
        // If no players left, you might want to delete the session
        if (session.players.length === 0) {
          await Session.deleteOne({ session_id: sessionId });
          return res.status(200).json({ status: 'Session deleted - no players remaining' });
        }

        await session.save();

        res.status(200).json({
          status: 'Player left session',
          player_id,
          remaining_players: session.players.length
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error leaving session' });
      }
    }
  };
};