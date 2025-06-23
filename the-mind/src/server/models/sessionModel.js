import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    player_id: { type: String, required: true },
    nickname: { type: String, required: true },
    hand: { type: [Number], default: [] }, // Array of card numbers (1-100)
    character_id: { type: String, default: null },
    is_ready: { type: Boolean, default: false }
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
    });

    // Store remaining deck
    this.deck = fullDeck.slice(totalCardsNeeded);
    
    // Reset cards played for new level
    this.cards_played = [];
    this.current_turn_start = new Date();
};

// Method to check if card play is valid
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
    return this.lives <= 0 || this.level > this.game_settings.max_levels;
};

// Method to use shuriken (remove lowest card from all hands)
SessionSchema.methods.useShuriken = function() {
    if (this.shurikens <= 0) return false;
    
    const nextCard = this.getNextExpectedCard();
    if (!nextCard) return false;

    // Remove the lowest card from the player who has it
    this.players.forEach(player => {
        const cardIndex = player.hand.indexOf(nextCard);
        if (cardIndex !== -1) {
            player.hand.splice(cardIndex, 1);
        }
    });

    this.shurikens--;
    return true;
};

const Session = mongoose.model('Session', SessionSchema);
export default Session;