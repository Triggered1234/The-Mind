// server/dependencies.js
import { v4 as uuidv4 } from 'uuid';
import Session from './models/sessionModel.js';
import User from './models/userModel.js';

export default {
  Session,
  User,
  uuidv4
};