import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(200).json({ user_id: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });
        
        const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ user_id: user._id, token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Email not found' });
        
        res.status(200).json({ status: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing request' });
    }
};