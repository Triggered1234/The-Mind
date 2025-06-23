// routes/authRoute.js
import express from 'express';
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  getUserProfile 
} from '../controllers/authController.js';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);      // POST /auth/register
router.post('/login', loginUser);            // POST /auth/login  
router.post('/forgot-password', forgotPassword); // POST /auth/forgot-password

// User profile routes
router.get('/users/:userId', getUserProfile); // GET /auth/users/:userId

export default router;