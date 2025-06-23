// controllers/sessionController.js

export const createSessionController = (deps) => {
  const { Session, uuidv4 } = deps;

  // Generate a short, user-friendly session code
  const generateSessionCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Check if session code already exists
  const isSessionCodeUnique = async (code) => {
    const existingSession = await Session.findOne({ session_id: code });
    return !existingSession;
  };

  // Generate a unique session code
  const generateUniqueSessionCode = async () => {
    let code;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateSessionCode();
      attempts++;
    } while (!(await isSessionCodeUnique(code)) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique session code');
    }

    return code;
  };

  return {
    createSession: async (req, res) => {
      try {
        const { player_id, nickname, max_players = 4 } = req.query;
        
        if (!player_id || !nickname) {
          return res.status(400).json({ error: 'player_id and nickname are required' });
        }

        // Generate a short, unique session code instead of UUID
        const sessionCode = await generateUniqueSessionCode();

        const session = new Session({
          session_id: sessionCode, // Use short code instead of UUID
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

        // Check if session is full
        if (session.players.length >= session.max_players) {
          return res.status(400).json({ error: 'Session is full' });
        }

        // Check if player is already in session
        const existingPlayer = session.players.find(p => p.player_id === player_id);
        if (existingPlayer) {
          return res.status(200).json({
            session_id: sessionId,
            player_id: player_id,
            nickname: nickname,
            message: 'Player already in session'
          });
        }

        // Add player to session
        session.players.push({
          player_id,
          nickname,
          hand: [],
          is_ready: false
        });

        await session.save();

        res.status(200).json({
          session_id: sessionId,
          player_id: player_id,
          nickname: nickname
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error joining session' });
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

        // Remove player from session
        session.players = session.players.filter(p => p.player_id !== player_id);

        if (session.players.length === 0) {
          // Delete session if no players left
          await Session.deleteOne({ session_id: sessionId });
        } else {
          await session.save();
        }

        res.status(200).json({ message: 'Left session successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error leaving session' });
      }
    },

    getPlayers: async (req, res) => {
      try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const players = session.players.map(p => ({
          player_id: p.player_id,
          nickname: p.nickname,
          character_id: p.character_id,
          is_ready: p.is_ready,
          cards_remaining: p.hand ? p.hand.length : 0
        }));

        res.status(200).json({ players });
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

        res.status(200).json({ message: 'Character chosen successfully' });
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
          player_id: player_id,
          is_ready: player.is_ready
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

        // Check if all players are ready
        const allReady = session.players.every(p => p.is_ready);
        if (!allReady) {
          return res.status(400).json({ error: 'All players must be ready to start' });
        }

        // Check minimum player count
        if (session.players.length < 2) {
          return res.status(400).json({ error: 'Need at least 2 players to start' });
        }

        session.status = 'started';
        await session.save();

        res.status(200).json({ 
          status: 'Game started',
          session_id: sessionId
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

        // Reset game state using the new method
        session.resetForReplay();
        await session.save();

        res.status(200).json({ 
          status: 'Game reset - returning to lobby',
          session_id: sessionId,
          message: 'Players can now choose characters and get ready again'
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error replaying game' });
      }
    }
  };
};