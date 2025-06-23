// controllers/gameController.js

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
          my_hand: player.hand || [],
          cards_played: session.cards_played || [],
          players: session.players.map(p => ({
            player_id: p.player_id,
            nickname: p.nickname,
            character_id: p.character_id,
            cards_remaining: (p.hand || []).length,
            is_ready: p.is_ready
          })),
          next_expected_card: session.getNextExpectedCard(),
          is_level_complete: session.isLevelComplete(),
          is_game_over: session.isGameOver(),
          shuriken_voting: session.shuriken_voting?.active ? {
            active: session.shuriken_voting.active,
            initiated_by: session.shuriken_voting.initiated_by,
            votes: session.shuriken_voting.votes || [],
            votes_needed: session.players.length
          } : undefined
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
          cards_dealt: session.level,
          lives: session.lives,
          shurikens: session.shurikens
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

        console.log(`Playing card ${card} for player ${player_id} in session ${sessionId}`);

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

        // Get the lowest card across all hands to check if this is a valid play
        const lowestCard = session.getNextExpectedCard();
        console.log(`Lowest card in all hands: ${lowestCard}, Playing card: ${card}`);

        // Check if this is a valid card to play (card must be the lowest remaining card)
        if (lowestCard !== null && card !== lowestCard) {
          // Invalid play - lose a life
          session.lives--;
          console.log(`Invalid card played! Expected: ${lowestCard}, Played: ${card}. Lives remaining: ${session.lives}`);
          
          // Remove the incorrectly played card from player's hand
          player.hand.splice(cardIndex, 1);
          
          // Add the incorrect card to played cards for tracking
          session.cards_played.push({
            card,
            player_id,
            timestamp: new Date(),
            incorrect: true
          });

          // Discard all cards that are LOWER than the incorrectly played card from ALL players
          const discardedCards = [];
          session.players.forEach(sessionPlayer => {
            // Find cards that are lower than the played card
            const cardsToDiscard = sessionPlayer.hand.filter(handCard => handCard < card);
            // Remove those cards from the hand
            sessionPlayer.hand = sessionPlayer.hand.filter(handCard => handCard >= card);
            
            // Track what was discarded
            cardsToDiscard.forEach(discardedCard => {
              discardedCards.push({
                card: discardedCard,
                player_id: sessionPlayer.player_id,
                player_nickname: sessionPlayer.nickname
              });
            });
          });

          console.log(`Discarded cards: ${JSON.stringify(discardedCards)}`);

          // Check if game is over
          if (session.isGameOver()) {
            session.status = 'game_over';
            await session.save();
            
            return res.status(200).json({
              status: 'Game Over',
              card_played: card,
              expected_card: lowestCard,
              lives_remaining: session.lives,
              game_over: true,
              incorrect_play: true,
              discarded_cards: discardedCards
            });
          }

          await session.save();
          return res.status(200).json({
            status: 'Incorrect card played - life lost',
            card_played: card,
            expected_card: lowestCard,
            lives_remaining: session.lives,
            lives_lost: 1,
            incorrect_play: true,
            discarded_cards: discardedCards,
            next_expected: session.getNextExpectedCard()
          });
        }

        // Valid play - remove card from player's hand and add to played cards
        player.hand.splice(cardIndex, 1);
        session.cards_played.push({
          card,
          player_id,
          timestamp: new Date()
        });

        console.log(`Valid card played: ${card}. Cards played so far: ${session.cards_played.length}`);
        console.log(`Checking if level is complete: ${session.isLevelComplete()}`);

        // Check if level is complete (ALL cards have been played)
        if (session.isLevelComplete()) {
          session.status = 'level_complete';
          session.level++;
          
          console.log(`Level complete! Moving to level ${session.level}`);
          
          // Add bonus shuriken every 3 levels
          if (session.level % 3 === 1 && session.level <= 10) {
            session.shurikens++;
            console.log(`Bonus shuriken added! Total: ${session.shurikens}`);
          }

          // Check if game is completed (reached max levels)
          if (session.level > (session.game_settings?.max_levels || 12)) {
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
        console.error('Error in playCard:', error);
        res.status(500).json({ error: 'Error playing card' });
      }
    },

    // Initiate shuriken vote
    initiateShurikenVote: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id } = req.body;

        console.log(`Initiating shuriken vote for player ${player_id} in session ${sessionId}`);

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'playing') {
          return res.status(400).json({ error: 'Can only use shuriken during play' });
        }

        const result = session.initiateShurikenVote(player_id);
        
        if (!result.success) {
          return res.status(400).json({ error: result.message });
        }

        await session.save();

        res.status(200).json({
          status: 'Shuriken vote initiated',
          initiated_by: player_id,
          votes_needed: session.players.length,
          current_votes: session.shuriken_voting.votes.length
        });

      } catch (error) {
        console.error('Error initiating shuriken vote:', error);
        res.status(500).json({ error: 'Error initiating shuriken vote' });
      }
    },

    // Cast shuriken vote
    castShurikenVote: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id, vote } = req.body; // vote is true/false

        console.log(`Player ${player_id} voting ${vote} for shuriken in session ${sessionId}`);

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const result = session.castShurikenVote(player_id, vote);
        
        if (!result.success) {
          return res.status(400).json({ error: result.message });
        }

        // Check if voting is complete
        const voteResult = session.checkShurikenVoteResult();
        
        if (voteResult.complete) {
          if (voteResult.passed) {
            // Execute the shuriken
            const executionResult = session.executeShurikenVote();
            
            if (executionResult.success) {
              console.log(`Shuriken vote passed and executed. Cards removed: ${JSON.stringify(executionResult.removed_cards)}`);
              
              // Check if level is complete after shuriken
              if (session.isLevelComplete()) {
                session.status = 'level_complete';
                session.level++;
                
                // Add bonus shuriken every 3 levels
                if (session.level % 3 === 1 && session.level <= 10) {
                  session.shurikens++;
                }

                // Check if game is completed
                if (session.level > (session.game_settings?.max_levels || 12)) {
                  session.status = 'completed';
                  await session.save();
                  
                  return res.status(200).json({
                    status: 'Game Completed with Shuriken!',
                    vote_passed: true,
                    shuriken_executed: true,
                    removed_cards: executionResult.removed_cards,
                    discarded_cards: executionResult.discarded_cards,
                    level_complete: true,
                    game_completed: true,
                    final_level: session.level - 1,
                    shurikens_remaining: session.shurikens
                  });
                }

                await session.save();
                return res.status(200).json({
                  status: 'Level Completed with Shuriken!',
                  vote_passed: true,
                  shuriken_executed: true,
                  removed_cards: executionResult.removed_cards,
                  discarded_cards: executionResult.discarded_cards,
                  level_complete: true,
                  next_level: session.level,
                  shurikens_remaining: session.shurikens
                });
              }

              await session.save();
              return res.status(200).json({
                status: 'Shuriken vote passed and executed',
                vote_passed: true,
                shuriken_executed: true,
                removed_cards: executionResult.removed_cards,
                discarded_cards: executionResult.discarded_cards,
                shurikens_remaining: session.shurikens,
                next_expected: session.getNextExpectedCard()
              });
            } else {
              session.cancelShurikenVote();
              await session.save();
              return res.status(400).json({ error: executionResult.message });
            }
          } else {
            // Vote failed
            session.cancelShurikenVote();
            await session.save();
            
            console.log('Shuriken vote failed');
            return res.status(200).json({
              status: 'Shuriken vote failed',
              vote_passed: false,
              current_votes: 0,
              votes_needed: session.players.length
            });
          }
        } else {
          // Voting still in progress
          await session.save();
          return res.status(200).json({
            status: 'Vote cast successfully',
            vote_in_progress: true,
            current_votes: session.shuriken_voting.votes.length,
            votes_needed: session.players.length
          });
        }

      } catch (error) {
        console.error('Error casting shuriken vote:', error);
        res.status(500).json({ error: 'Error casting shuriken vote' });
      }
    },

    // Use a shuriken (legacy - replaced by voting system)
    useShuriken: async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { player_id } = req.body;

        // Redirect to initiate vote instead
        return res.status(400).json({ 
          error: 'Shuriken usage requires all players to vote. Use /initiate-shuriken-vote instead.' 
        });

      } catch (error) {
        console.error('Error in useShuriken:', error);
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
          cards_played: session.cards_played || [],
          total_cards_played: (session.cards_played || []).length
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving cards played' });
      }
    },

    // Get a player's hand (for debugging)
    getPlayerHand: async (req, res) => {
      try {
        const { sessionId, playerId } = req.params;

        const session = await Session.findOne({ session_id: sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const player = session.players.find(p => p.player_id === playerId);
        if (!player) {
          return res.status(404).json({ error: 'Player not found in session' });
        }

        res.status(200).json({
          player_id: playerId,
          nickname: player.nickname,
          hand: player.hand || [],
          cards_remaining: (player.hand || []).length
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving player hand' });
      }
    }
  };
};