import * as chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authController from '../controllers/authController.js';
import User from '../models/userModel.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('authController', () => {
    let req, res, statusStub, jsonStub;

    beforeEach(() => {
        req = { body: {} };
        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub });
        res = { status: statusStub };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('registerUser', () => {
        it('should register a user and return user_id and username', async () => {
            req.body = { username: 'test', email: 'test@test.com', password: 'pass' };
            sinon.stub(bcrypt, 'hash').resolves('hashedpass');
            const saveStub = sinon.stub().resolves();
            sinon.stub(User.prototype, 'save').callsFake(saveStub);
            sinon.stub(User.prototype, '_id').value('123');
            sinon.stub(User.prototype, 'username').value('test');

            await authController.registerUser(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.calledWith({ user_id: '123', username: 'test' })).to.be.true;
        });

        it('should handle errors and return 500', async () => {
            sinon.stub(bcrypt, 'hash').throws(new Error('fail'));
            req.body = { username: 'test', email: 'test@test.com', password: 'pass' };

            await authController.registerUser(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWithMatch({ error: 'Error registering user' })).to.be.true;
        });
    });

    describe('loginUser', () => {
        it('should login user and return user_id and token', async () => {
            req.body = { email: 'test@test.com', password: 'pass' };
            const user = { _id: '123', password: 'hashedpass' };
            sinon.stub(User, 'findOne').resolves(user);
            sinon.stub(bcrypt, 'compare').resolves(true);
            sinon.stub(jwt, 'sign').returns('token');
            process.env.JWT_SECRET = 'secret';

            await authController.loginUser(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.calledWith({ user_id: '123', token: 'token' })).to.be.true;
        });

        it('should return 404 if user not found', async () => {
            req.body = { email: 'notfound@test.com', password: 'pass' };
            sinon.stub(User, 'findOne').resolves(null);

            await authController.loginUser(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonStub.calledWithMatch({ error: 'User not found' })).to.be.true;
        });

        it('should return 401 if password does not match', async () => {
            req.body = { email: 'test@test.com', password: 'wrong' };
            const user = { _id: '123', password: 'hashedpass' };
            sinon.stub(User, 'findOne').resolves(user);
            sinon.stub(bcrypt, 'compare').resolves(false);

            await authController.loginUser(req, res);

            expect(statusStub.calledWith(401)).to.be.true;
            expect(jsonStub.calledWithMatch({ error: 'Invalid email or password' })).to.be.true;
        });

        it('should handle errors and return 500', async () => {
            sinon.stub(User, 'findOne').throws(new Error('fail'));
            req.body = { email: 'test@test.com', password: 'pass' };

            await authController.loginUser(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWithMatch({ error: 'Error logging in' })).to.be.true;
        });
    });

    describe('forgotPassword', () => {
        it('should return 200 if email exists', async () => {
            req.body = { email: 'test@test.com' };
            sinon.stub(User, 'findOne').resolves({ _id: '123' });

            await authController.forgotPassword(req, res);

            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.calledWith({ status: 'Password reset email sent' })).to.be.true;
        });

        it('should return 404 if email not found', async () => {
            req.body = { email: 'notfound@test.com' };
            sinon.stub(User, 'findOne').resolves(null);

            await authController.forgotPassword(req, res);

            expect(statusStub.calledWith(404)).to.be.true;
            expect(jsonStub.calledWithMatch({ error: 'Email not found' })).to.be.true;
        });

        it('should handle errors and return 500', async () => {
            sinon.stub(User, 'findOne').throws(new Error('fail'));
            req.body = { email: 'test@test.com' };

            await authController.forgotPassword(req, res);

            expect(statusStub.calledWith(500)).to.be.true;
            expect(jsonStub.calledWithMatch({ error: 'Error processing request' })).to.be.true;
        });
    });
});