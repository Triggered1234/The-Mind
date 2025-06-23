import { expect } from 'chai';
import sinon from 'sinon';
import { createController } from '../controllers/sessionController.js';

describe('sessionController', () => {
  let sessionController;
  let SessionMock;
  let uuidv4Stub;

  beforeEach(() => {
    uuidv4Stub = sinon.stub().returns('mock-session-id');

    SessionMock = function (data) {
      this.session_id = data.session_id;
      this.max_players = data.max_players;
      this.players = data.players || [];
      this.status = data.status || 'waiting';
      this.level = data.level || 1;

      this.save = sinon.stub().resolves();
    };
    SessionMock.findOne = sinon.stub();

    sessionController = createController({ Session: SessionMock, uuidv4: uuidv4Stub });
  });

  describe('createSession', () => {
    it('should create a new session and return it', async () => {
      const req = { query: { player_id: 'player1', max_players: 4 } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.createSession(req, res);

      expect(uuidv4Stub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;

      const session = res.json.firstCall.args[0];
      expect(session.session_id).to.equal('mock-session-id');
      expect(session.players).to.include('player1');
      expect(session.max_players).to.equal(4);
      expect(session.status).to.equal('waiting');
    });
  });

  describe('joinSession', () => {
    it('should add a player to an existing session', async () => {
      const fakeSession = new SessionMock({
        session_id: 'session-123',
        max_players: 4,
        players: ['player1'],
        status: 'waiting',
      });
      SessionMock.findOne.resolves(fakeSession);

      const req = {
        params: { sessionId: 'session-123' },
        body: { player_id: 'player2', nickname: 'Nick' },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.joinSession(req, res);

      expect(SessionMock.findOne.calledWith({ session_id: 'session-123' })).to.be.true;
      expect(fakeSession.players).to.include('player2');
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        session_id: 'session-123',
        player_id: 'player2',
        nickname: 'Nick',
      })).to.be.true;
    });

    it('should return 404 when session does not exist', async () => {
      SessionMock.findOne.resolves(null);

      const req = { params: { sessionId: 'no-session' }, body: { player_id: 'p' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.joinSession(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: 'Session not found' })).to.be.true;
    });

    it('should return 400 when session is full', async () => {
      const fullSession = new SessionMock({
        session_id: 'full-session',
        max_players: 2,
        players: ['p1', 'p2'],
        status: 'waiting',
      });
      SessionMock.findOne.resolves(fullSession);

      const req = { params: { sessionId: 'full-session' }, body: { player_id: 'p3' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.joinSession(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: 'Session is full' })).to.be.true;
    });
  });

  describe('requestShuriken', () => {
    it('should return shuriken request status', async () => {
      const req = {
        params: { sessionId: 'session-1' },
        body: { player_id: 'player1' },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.requestShuriken(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'Player player1 requested to use a shuriken.' })).to.be.true;
    });
  });

  describe('moveToNextLevel', () => {
    it('should increment the level', async () => {
      const fakeSession = new SessionMock({
        session_id: 'session-123',
        level: 1,
        status: 'waiting',
      });
      SessionMock.findOne.resolves(fakeSession);

      const req = { params: { sessionId: 'session-123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.moveToNextLevel(req, res);

      expect(fakeSession.level).to.equal(2);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'Moved to level 2' })).to.be.true;
    });

    it('should default to level 2 if level undefined', async () => {
      const fakeSession = new SessionMock({
        session_id: 'session-undefined-level',
        level: undefined,
      });
      SessionMock.findOne.resolves(fakeSession);

      const req = { params: { sessionId: 'session-undefined-level' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.moveToNextLevel(req, res);

      expect(fakeSession.level).to.equal(2);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'Moved to level 2' })).to.be.true;
    });

    it('should return 404 if session not found', async () => {
      SessionMock.findOne.resolves(null);

      const req = { params: { sessionId: 'not-found' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.moveToNextLevel(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: 'Session not found' })).to.be.true;
    });
  });

  describe('playCard', () => {
    it('should acknowledge card play', async () => {
      const req = {
        params: { sessionId: 'session-1' },
        body: { player_id: 'player1', card: 'card5' },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.playCard(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'Player player1 played card card5' })).to.be.true;
    });
  });

  describe('chooseCharacter', () => {
    it('should acknowledge character choice', async () => {
      const req = {
        params: { sessionId: 'session-1' },
        body: { player_id: 'player1', character_id: 'char1' },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.chooseCharacter(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        session_id: 'session-1',
        player_id: 'player1',
        character_id: 'char1',
        status: 'Character chosen',
      })).to.be.true;
    });
  });

  describe('startGame', () => {
    it('should start the game', async () => {
      const fakeSession = new SessionMock({
        session_id: 'session-123',
        status: 'waiting',
      });
      SessionMock.findOne.resolves(fakeSession);

      const req = { params: { sessionId: 'session-123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.startGame(req, res);

      expect(fakeSession.status).to.equal('started');
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'Game started' })).to.be.true;
    });

    it('should return 404 if session not found', async () => {
      SessionMock.findOne.resolves(null);

      const req = { params: { sessionId: 'no-session' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.startGame(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: 'Session not found' })).to.be.true;
    });
  });

  describe('replayGame', () => {
    it('should reset session state', async () => {
      const fakeSession = new SessionMock({
        session_id: 'session-123',
        level: 3,
        status: 'started',
      });
      SessionMock.findOne.resolves(fakeSession);

      const req = { params: { sessionId: 'session-123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.replayGame(req, res);

      expect(fakeSession.level).to.equal(1);
      expect(fakeSession.status).to.equal('waiting');
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'Game restarted' })).to.be.true;
    });

    it('should return 404 if session not found', async () => {
      SessionMock.findOne.resolves(null);

      const req = { params: { sessionId: 'no-session' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await sessionController.replayGame(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: 'Session not found' })).to.be.true;
    });
  });
});
