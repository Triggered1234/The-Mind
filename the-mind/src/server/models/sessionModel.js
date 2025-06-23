// models/sessionModel.js
import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    player_id: { type: String, required: true },
    nickname: { type: String, required: true },
    hand: { type: [Number], default: [] }, // Array of card numbers (1-100)
    character_id: { type: String, default: null },
    is_ready: { type: Boolean, default: false },
    shuriken_vote: { type: Boolean, default: false } // Vote for using shuriken
});

const SessionSchema = new mongoose.Schema({
    session_id: { type: String, required: true, unique: true },
    max_players: { type: Number, required: true, min: 2, max: 4 },
    players: { type: [PlayerSchema], default: [] },
    status: { 
        type: String, 
        required: true, 
        default: 'waiting',
        enum: ['waiting', 'started', 'playing', 'level_complete', 'game_over', 'completed']
    },
    level: { type: Number, default: 1 },
    lives: { type: Number, default: 3 }, // Start with 3 lives
    shurikens: { type: Number, default: 1 }, // Start with 1 shuriken
    cards_played: { 
        type: [{
            card: Number,
            player_id: String,
            timestamp: { type: Date, default: Date.now }
        }], 
        default: [] 
    },
    deck: { type: [Number], default: [] }, // Remaining cards in deck
    current_turn_start: { type: Date },
    shuriken_voting: {
        active: { type: Boolean, default: false },
        initiated_by: { type: String, default: null },
        votes: { type: [String], default: [] }, // Array of player_ids who voted yes
        timestamp: { type: Date, default: null }
    },
    game_settings: {
        max_levels: { type: Number, default: 12 }, // Standard Mind game has 12 levels
        cards_per_level: { type: Boolean, default: true }, // Level 1 = 1 card, Level 2 = 2 cards, etc.
    }
}, { timestamps: true });

// Method to shuffle and deal cards
SessionSchema.methods.dealCards = function() {
    // Create deck of cards 1-100
    const fullDeck = Array.from({ length: 100 }, (_, i) => i + 1);
    
    // Shuffle deck
    for (let i = fullDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    // Calculate total cards needed for this level
    const cardsPerPlayer = this.level;
    const totalCardsNeeded = this.players.length * cardsPerPlayer;

    // Deal cards to players
    let cardIndex = 0;
    this.players.forEach(player => {
        player.hand = [];
        for (let i = 0; i < cardsPerPlayer; i++) {
            player.hand.push(fullDeck[cardIndex++]);
        }
        // Sort each player's hand
        player.hand.sort((a, b) => a - b);
        // Reset shuriken votes
        player.shuriken_vote = false;
    });

    // Store remaining deck
    this.deck = fullDeck.slice(totalCardsNeeded);
    
    // Reset cards played and voting for new level
    this.cards_played = [];
    this.current_turn_start = new Date();
    this.shuriken_voting = {
        active: false,
        initiated_by: null,
        votes: [],
        timestamp: null
    };
};

// Method to check if card play is valid (any card higher than last played card)
SessionSchema.methods.isValidCardPlay = function(card) {
    if (this.cards_played.length === 0) {
        return true; // First card can be anything
    }
    
    const lastPlayedCard = this.cards_played[this.cards_played.length - 1].card;
    return card > lastPlayedCard;
};

// Method to check if level is complete
SessionSchema.methods.isLevelComplete = function() {
    const totalCardsInHands = this.players.reduce((sum, player) => sum + player.hand.length, 0);
    return totalCardsInHands === 0;
};

// Method to get next expected card (lowest card in all hands)
SessionSchema.methods.getNextExpectedCard = function() {
    const allCards = [];
    this.players.forEach(player => {
        allCards.push(...player.hand);
    });
    
    if (allCards.length === 0) return null;
    return Math.min(...allCards);
};

// Method to check if game is over
SessionSchema.methods.isGameOver = function() {
    return this.lives <= 0;
};

// Method to automatically discard all cards lower than the played card
SessionSchema.methods.discardCardsLowerThan = function(playedCard) {
    const discardedCards = [];
    
    this.players.forEach(player => {
        // Find all cards in hand that are lower than the played card
        const cardsToDiscard = player.hand.filter(card => card < playedCard);
        
        // Remove these cards from the player's hand
        player.hand = player.hand.filter(card => card >= playedCard);
        
        // Add to discarded list with player info
        cardsToDiscard.forEach(card => {
            discardedCards.push({
                card: card,
                player_id: player.player_id,
                player_nickname: player.nickname
            });
        });
    });
    
    return discardedCards;
};

// Method to initiate shuriken voting
SessionSchema.methods.initiateShurikenVote = function(playerId) {
    if (this.shurikens <= 0) {
        return { success: false, message: 'No shurikens available' };
    }
    
    if (this.shuriken_voting.active) {
        return { success: false, message: 'Shuriken vote already in progress' };
    }
    
    // Start the voting process
    this.shuriken_voting = {
        active: true,
        initiated_by: playerId,
        votes: [playerId], // Initiator automatically votes yes
        timestamp: new Date()
    };
    
    return { success: true, message: 'Shuriken vote initiated' };
};

// Method to cast a shuriken vote
SessionSchema.methods.castShurikenVote = function(playerId, voteYes) {
    if (!this.shuriken_voting.active) {
        return { success: false, message: 'No active shuriken vote' };
    }
    
    const player = this.players.find(p => p.player_id === playerId);
    if (!player) {
        return { success: false, message: 'Player not found' };
    }
    
    // Remove any existing vote from this player
    this.shuriken_voting.votes = this.shuriken_voting.votes.filter(id => id !== playerId);
    
    // Add vote if yes
    if (voteYes) {
        this.shuriken_voting.votes.push(playerId);
    }
    
    return { success: true, votes: this.shuriken_voting.votes.length };
};

// Method to check if all players have voted yes for shuriken
SessionSchema.methods.checkShurikenVoteResult = function() {
    if (!this.shuriken_voting.active) {
        return { complete: false };
    }
    
    const totalPlayers = this.players.length;
    const yesVotes = this.shuriken_voting.votes.length;
    
    // Check if all players voted yes
    if (yesVotes === totalPlayers) {
        return { complete: true, passed: true };
    }
    
    // Check if enough players voted no (impossible to pass)
    const playersWhoVoted = this.shuriken_voting.votes.length;
    const maxPossibleYes = playersWhoVoted + (totalPlayers - playersWhoVoted);
    
    if (maxPossibleYes < totalPlayers) {
        return { complete: true, passed: false };
    }
    
    return { complete: false };
};

// Method to execute shuriken (remove lowest card from each player and discard lower cards)
SessionSchema.methods.executeShurikenVote = function() {
    if (!this.shuriken_voting.active) {
        return { success: false, message: 'No active shuriken vote' };
    }
    
    if (this.shurikens <= 0) {
        return { success: false, message: 'No shurikens available' };
    }
    
    const removedCards = [];
    const discardedCards = [];
    
    // Step 1: Remove the lowest card from each player's hand
    this.players.forEach(player => {
        if (player.hand.length > 0) {
            const lowestCard = Math.min(...player.hand);
            const cardIndex = player.hand.indexOf(lowestCard);
            
            if (cardIndex !== -1) {
                player.hand.splice(cardIndex, 1);
                removedCards.push({
                    card: lowestCard,
                    player_id: player.player_id,
                    player_nickname: player.nickname
                });
            }
        }
    });
    
    // Step 2: Find the highest of the removed cards
    const highestRemovedCard = removedCards.length > 0 ? 
        Math.max(...removedCards.map(r => r.card)) : 0;
    
    // Step 3: Discard all cards lower than the highest removed card from all players
    this.players.forEach(player => {
        const cardsToDiscard = player.hand.filter(card => card < highestRemovedCard);
        player.hand = player.hand.filter(card => card >= highestRemovedCard);
        
        cardsToDiscard.forEach(card => {
            discardedCards.push({
                card: card,
                player_id: player.player_id,
                player_nickname: player.nickname
            });
        });
    });
    
    // Use up one shuriken
    this.shurikens--;
    
    // Reset voting
    this.shuriken_voting = {
        active: false,
        initiated_by: null,
        votes: [],
        timestamp: null
    };
    
    return {
        success: true,
        removed_cards: removedCards,
        discarded_cards: discardedCards,
        highest_removed_card: highestRemovedCard
    };
};

// Method to cancel shuriken vote
SessionSchema.methods.cancelShurikenVote = function() {
    this.shuriken_voting = {
        active: false,
        initiated_by: null,
        votes: [],
        timestamp: null
    };
};

// Method to reset game state for replay
SessionSchema.methods.resetForReplay = function() {
    this.status = 'waiting';
    this.level = 1;
    this.lives = 3;
    this.shurikens = 1;
    this.cards_played = [];
    this.deck = [];
    this.current_turn_start = null;
    this.shuriken_voting = {
        active: false,
        initiated_by: null,
        votes: [],
        timestamp: null
    };
    
    // Reset all players
    this.players.forEach(player => {
        player.hand = [];
        player.is_ready = false;
        player.shuriken_vote = false;
    });
};

const Session = mongoose.model('Session', SessionSchema);
export default Session;