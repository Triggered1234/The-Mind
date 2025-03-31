import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
    session_id: { type: String, required: true },
    player_id: { type: String, required: true },
    cards: { type: [Number], required: true },
    character_id: { type: String, required: true },
}, { timestamps: true });

const Game = mongoose.model('Game', GameSchema);
export default Game;