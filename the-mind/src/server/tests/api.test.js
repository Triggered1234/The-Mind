// tests/api.test.js
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

// Import your app components
import { createSessionController } from '../controllers/sessionController.js';
import { createGameController } from '../controllers/gameController.js';
import { createSessionRouter } from '../routes/sessionRoute.js';
import Session from '../models/sessionModel.js';

describe('The Mind Game API Integration Tests', () => {
  let app;
  let sessionId;
  let player1Id = 'player-1';
  let player2Id = 'player-2';

  before(async () => {
    // Setup test app
    app = express();
    app.use(bodyParser.json());

    // Connect to test database
    const testDbUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/themind_test';
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Setup controllers and routes
    const deps = {
      Session,
      uuidv4: () => 'test-session-id'
    };

    const sessionController = createSessionController(deps);
    const gameController = createGameController(deps);
    const sessionRouter = createSessionRouter(sessionController, gameController);

    app.use('/api/sessions', sessionRouter);
  });

  beforeEach(async () => {
    // Clean database before each test
    await Session.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('Session Management', () => {
    it('should create a new session', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .query({
          player_id: player1Id,
          nickname: 'Player1',
          max_players: 4
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('session_id');
      expect(res.body.players).to.have.length(1);
      expect(res.body.players[0].player_id).to.equal(player1Id);
      sessionId = res.body.session_id;
    });

    it('should allow a second player to join', async () => {
      // First create a session
      await request(app)
        .post('/api/sessions')
        .query({
          player_id: player1Id,
          nickname: 'Player1'
        });

      const res = await request(app)
        .post('/api/sessions/test-session-id/players')
        .send({
          player_id: player2Id,
          nickname: 'Player2'
        });

      expect(res.status).to.equal(200);
      expect(res.body.players).to.have.length(2);
    });

    it('should get session details', async () => {
      // Create session first
      await request(app)
        .post('/api/sessions')
        .query({
          player_id: player1Id,
          nickname: 'Player1'
        });

      const res = await request(app)
        .get('/api/sessions/test-session-id');

      expect(res.status).to.equal(200);
      expect(res.body.session_id).to.equal('test-session-id');
      expect(res.body.status).to.equal('waiting');
    });

    it('should prevent joining a full session', async () => {
      // Create session with max 2 players
      await request(app)
        .post('/api/sessions')
        .query({
          player_id: player1Id,
          nickname: 'Player1',
          max_players: 2
        });

      // Add second player
      await request(app)
        .post('/api/sessions/test-session-id/players')
        .send({
          player_id: player2Id,
          nickname: 'Player2'
        });

      // Try to add third player
      const res = await request(app)
        .post('/api/sessions/test-session-id/players')
        .send({
          player_id: 'player-3',
          nickname: 'Player3'
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Session is full');
    });
  });

  describe('Game Flow', () => {
    beforeEach(async () => {
      // Create session with 2 players
      await request(app)
        .post('/api/sessions')
        .query({
          player_id: player1Id,
          nickname: 'Player1'
        });

      await request(app)
        .post('/api/sessions/test-session-id/players')
        .send({
          player_id: player2Id,
          nickname: 'Player2'
        });
    });

    it('should allow players to mark as ready', async () => {
      const res = await request(app)
        .patch('/api/sessions/test-session-id/ready')
        .send({
          player_id: player1Id
        });

      expect(res.status).to.equal(200);
      expect(res.body.is_ready).to.be.true;
    });

    it('should start game when all players are ready', async () => {
      // Mark both players as ready
      await request(app)
        .patch('/api/sessions/test-session-id/ready')
        .send({ player_id: player1Id });

      await request(app)
        .patch('/api/sessions/test-session-id/ready')
        .send({ player_id: player2Id });

      // Start game
      const res = await request(app)
        .post('/api/sessions/test-session-id/start');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('Game started');
    });

    it('should prevent starting game with unready players', async () => {
      // Only mark one player as ready
      await request(app)
        .patch('/api/sessions/test-session-id/ready')
        .send({ player_id: player1Id });

      const res = await request(app)
        .post('/api/sessions/test-session-id/start');

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('All players must be ready to start');
    });
  });

  describe('Gameplay', () => {
    beforeEach(async () => {
      // Setup complete game session
      await request(app)
        .post('/api/sessions')
        .query({
          player_id: player1Id,
          nickname: 'Player1'
        });

      await request(app)
        .post('/api/sessions/test-session-id/players')
        .send({
          player_id: player2Id,
          nickname: 'Player2'
        });

      // Mark players ready and start game
      await request(app)
        .patch('/api/sessions/test-session-id/ready')
        .send({ player_id: player1Id });

      await request(app)
        .patch('/api/sessions/test-session-id/ready')
        .send({ player_id: player2Id });

      await request(app)
        .post('/api/sessions/test-session-id/start');
    });

    it('should start a level and deal cards', async () => {
      const res = await request(app)
        .post('/api/sessions/test-session-id/level/start');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('Level started');
      expect(res.body.level).to.equal(1);
    });

    it('should get game state for a player', async () => {
      // Start level first
      await request(app)
        .post('/api/sessions/test-session-id/level/start');

      const res = await request(app)
        .get('/api/sessions/test-session-id/state')
        .query({ player_id: player1Id });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('my_hand');
      expect(res.body).to.have.property('level');
      expect(res.body).to.have.property('lives');
      expect(res.body.my_hand).to.have.length(1); // Level 1 = 1 card
    });

    it('should allow playing a valid card', async () => {
      // Start level
      await request(app)
        .post('/api/sessions/test-session-id/level/start');

      // Get game state to see what cards are available
      const stateRes = await request(app)
        .get('/api/sessions/test-session-id/state')
        .query({ player_id: player1Id });

      const playerCard = stateRes.body.my_hand[0];

      // Play the card
      const res = await request(app)
        .post('/api/sessions/test-session-id/cards')
        .send({
          player_id: player1Id,
          card: playerCard
        });

      expect(res.status).to.equal(200);
      expect(res.body.card_played).to.equal(playerCard);
    });

    it('should reject playing a card not in hand', async () => {
      // Start level
      await request(app)
        .post('/api/sessions/test-session-id/level/start');

      // Try to play a card not in hand
      const res = await request(app)
        .post('/api/sessions/test-session-id/cards')
        .send({
          player_id: player1Id,
          card: 999 // This card definitely won't be in hand
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Player does not have this card');
    });

    it('should use shuriken to remove lowest card', async () => {
      // Start level
      await request(app)
        .post('/api/sessions/test-session-id/level/start');

      const res = await request(app)
        .post('/api/sessions/test-session-id/shuriken')
        .send({
          player_id: player1Id
        });

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('Shuriken used');
      expect(res.body).to.have.property('card_removed');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent session', async () => {
      const res = await request(app)
        .get('/api/sessions/non-existent-session');

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal('Session not found');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .query({
          player_id: player1Id
          // missing nickname
        });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('required');
    });
  });
});