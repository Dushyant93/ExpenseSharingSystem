// Profile Controller Test Cases
// Covers: getProfile, updateProfile, changePassword

const chai     = require('chai');
const sinon    = require('sinon');
const mongoose = require('mongoose');

const User    = require('../models/User');
const Group   = require('../models/Group');
const Expense = require('../models/Expense');
const bcrypt  = require('bcrypt');  // controller uses 'bcrypt' not 'bcryptjs'

const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');

const { expect } = chai;

let sandbox;
beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(()  => { sandbox.restore(); });

describe('Profile Controller Tests', () => {

  //  getProfile 
  // Controller: findById().select('-password') + countDocuments x2 + find
  describe('getProfile', () => {

    it('should return the profile of the logged-in user', async () => {
      const userId   = new mongoose.Types.ObjectId();
      const req      = { user: { id: userId } };
      const mockUser = { _id: userId, name: 'Dushyant Singh', email: 'd@test.com' };

      sandbox.stub(User, 'findById').returns({
        select: sinon.stub().resolves(mockUser),
      });
      sandbox.stub(Group,   'countDocuments').resolves(2);
      sandbox.stub(Expense, 'countDocuments').resolves(5);
      sandbox.stub(Expense, 'find').resolves([{ amount: 30 }, { amount: 20 }]);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getProfile(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 if user does not exist', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(User, 'findById').returns({
        select: sinon.stub().resolves(null),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getProfile(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it('should return 500 if DB fetch fails', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(User, 'findById').returns({
        select: sinon.stub().throws(new Error('DB Error')),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getProfile(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  //  updateProfile 
  // Controller: findById() directly (no .select), then user.save()
  describe('updateProfile', () => {

    it('should update the user profile and return updated data', async () => {
      const userId   = new mongoose.Types.ObjectId();
      const req      = { user: { id: userId }, body: { name: 'Dushyant Updated' } };
      const mockUser = {
        _id:   userId,
        name:  'Dushyant Singh',
        email: 'd@test.com',
        save:  sinon.stub().resolves(),
      };

      sandbox.stub(User, 'findById').resolves(mockUser);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateProfile(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 if user not found during update', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() }, body: { name: 'Ghost' } };

      sandbox.stub(User, 'findById').resolves(null);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateProfile(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  //  changePassword 
  // Controller: findById() directly, bcrypt.compare, user.save()
  describe('changePassword', () => {

    it('should change password when current password is correct', async () => {
      const userId  = new mongoose.Types.ObjectId();
      const req     = {
        user: { id: userId },
        body: { currentPassword: 'oldpass123', newPassword: 'newpass456' },
      };
      const mockUser = {
        _id:      userId,
        password: 'hashed_old_password',
        save:     sinon.stub().resolves(),
      };

      sandbox.stub(User,   'findById').resolves(mockUser);
      sandbox.stub(bcrypt, 'compare').resolves(true);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await changePassword(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 400 if current password is incorrect', async () => {
      const userId  = new mongoose.Types.ObjectId();
      const req     = {
        user: { id: userId },
        body: { currentPassword: 'wrongpass', newPassword: 'newpass456' },
      };
      const mockUser = {
        _id:      userId,
        password: 'hashed_old_password',
        save:     sinon.stub().resolves(),
      };

      sandbox.stub(User,   'findById').resolves(mockUser);
      sandbox.stub(bcrypt, 'compare').resolves(false);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await changePassword(req, res);

      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should return 404 if user not found', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { currentPassword: 'oldpass123', newPassword: 'newpass456' },
      };

      sandbox.stub(User, 'findById').resolves(null);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await changePassword(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

});