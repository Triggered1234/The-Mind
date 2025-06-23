export const createGameController = (deps) => {
  const { Session } = deps;

  return {
    // Get current game state for a player
    getGameState: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id } = req.query;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const player = session.players.find(p => p.player_id === player_id);
        if (!player) {
          return res.status(404).json({ error: 'Player not found in session' });
        }

        // Return game state specific to this player
        const gameState = {
          session_id: sessionId,
          level: session.level,
          lives: session.lives,
          shurikens: session.shurikens,
          status: session.status,
          my_hand: player.hand,
          cards_played: session.cards_played,
          players: session.players.map(p => ({
            player_id: p.player_id,
            nickname: p.nickname,
            character_id: p.character_id,
            cards_remaining: p.hand.length,
            is_ready: p.is_ready
          })),
          next_expected_card: session.getNextExpectedCard(),
          is_level_complete: session.isLevelComplete(),
          is_game_over: session.isGameOver()
        };

        res.status(200).json(gameState);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving game state' });
      }
    },

    // Start a new level (deal cards)
    startLevel: async (req, res) => {
      try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'started' && session.status !== 'level_complete') {
          return res.status(400).json({ error: 'Game not ready to start level' });
        }

        // Deal cards for current level
        session.dealCards();
        session.status = 'playing';
        await session.save();

        res.status(200).json({
          status: 'Level started',
          level: session.level,
          cards_dealt: session.level
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error starting level' });
      }
    },

    // Play a card
    playCard: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id, card } = req.body;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'playing') {
          return res.status(400).json({ error: 'Game is not in playing state' });
        }

        const player = session.players.find(p => p.player_id === player_id);
        if (!player) {
          return res.status(404).json({ error: 'Player not found in session' });
        }

        // Check if player has this card
        const cardIndex = player.hand.indexOf(card);
        if (cardIndex === -1) {
          return res.status(400).json({ error: 'Player does not have this card' });
        }

        // Check if this is a valid card to play
        if (!session.isValidCardPlay(card)) {
          // Invalid play - lose a life
          session.lives--;
          
          // Remove the incorrectly played card and reveal what should have been played
          player.hand.splice(cardIndex, 1);
          const expectedCard = session.getNextExpectedCard();
          
          session.cards_played.push({
            card,
            player_id,
            timestamp: new Date()
          });

          if (session.isGameOver()) {
            session.status = 'game_over';
            await session.save();
            
            return res.status(200).json({
              status: 'Game Over',
              card_played: card,
              expected_card: expectedCard,
              lives_remaining: session.lives,
              game_over: true
            });
          }

          await session.save();
          return res.status(200).json({
            status: 'Incorrect card played',
            card_played: card,
            expected_card: expectedCard,
            lives_remaining: session.lives,
            lives_lost: 1
          });
        }

        // Valid play - remove card from player's hand
        player.hand.splice(cardIndex, 1);
        session.cards_played.push({
          card,
          player_id,
          timestamp: new Date()
        });

        // Check if level is complete
        if (session.isLevelComplete()) {
          session.status = 'level_complete';
          session.level++;
          
          // Add bonus shuriken every few levels
          if (session.level % 3 === 0 && session.level <= 9) {
            session.shurikens++;
          }

          // Check if game is completed
          if (session.level > session.game_settings.max_levels) {
            session.status = 'completed';
            await session.save();
            
            return res.status(200).json({
              status: 'Game Completed!',
              card_played: card,
              level_complete: true,
              game_completed: true,
              final_level: session.level - 1
            });
          }

          await session.save();
          return res.status(200).json({
            status: 'Level Complete!',
            card_played: card,
            level_complete: true,
            next_level: session.level,
            bonus_shuriken: session.level % 3 === 1 && session.level <= 10
          });
        }

        await session.save();
        res.status(200).json({
          status: 'Card played successfully',
          card_played: card,
          cards_remaining: player.hand.length,
          next_expected: session.getNextExpectedCard()
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error playing card' });
      }
    },

    // Use a shuriken
    useShuriken: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id } = req.body;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'playing') {
          return res.status(400).json({ error: 'Can only use shuriken during play' });
        }

        if (session.shurikens <= 0) {
          return res.status(400).json({ error: 'No shurikens available' });
        }

        const removedCard = session.getNextExpectedCard();
        const success = session.useShuriken();

        if (!success) {
          return res.status(400).json({ error: 'No cards to remove' });
        }

        await session.save();

        res.status(200).json({
          status: 'Shuriken used',
          card_removed: removedCard,
          shurikens_remaining: session.shurikens,
          next_expected: session.getNextExpectedCard()
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error using shuriken' });
      }
    },

    // Get cards played in order
    getCardsPlayed: async (req, res) => {
      try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json({
          cards_played: session.cards_played,
          total_played: session.cards_played.length
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving cards played' });
      }
    },

    // Get player hand (for debugging - normally this would be private)
    getPlayerHand: async (req, res) => {
      try {
        const { sessionId, playerId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const player = session.players.find(p => p.player_id === playerId);
        if (!player) {
          return res.status(404).json({ error: 'Player not found' });
        }

        res.status(200).json({
          player_id: playerId,
          hand: player.hand,
          cards_count: player.hand.length
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving player hand' });
      }
    }
  };
};