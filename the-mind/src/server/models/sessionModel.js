import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    session_id: { type: String, required: true, unique: true },
    max_players: { type: Number, required: true },
    players: { type: [String], default: [] },
    status: { type: String, required: true, default: 'waiting' },
}, { timestamps: true });

const Session = mongoose.model('Session', SessionSchema);
export default Session;
