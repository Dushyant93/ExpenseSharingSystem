// Group Controller Test Cases
// Uses Mocha (test runner), Chai (assertions), Sinon (mocking)
// Matches the exact style shown in Tutorial 4

const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Group = require('../models/Group');
const {
  getGroups, getGroupById, createGroup, updateGroup, deleteGroup,
} = require('../controllers/groupController');

const { expect } = chai;

describe('Group Controller Tests', () => {

  // Test Case 1: Get All Groups - Success
  describe('getGroups', () => {
    it('should return all groups for the logged-in user with status 200', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      const mockGroups = [
        { name: 'Brisbane Flat', icon: '🏠', description: 'Shared house expenses' },
        { name: 'Bali Trip 2025', icon: '🏖️', description: 'Holiday expenses' },
      ];

      const findStub = sinon.stub(Group, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort:     sinon.stub().resolves(mockGroups),
      });

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await getGroups(req, res);

      expect(res.json.calledWith(mockGroups)).to.be.true;

      findStub.restore();
    });

    // Test Case 2: Get All Groups - Database Error 
    it('should return 500 if database fetch fails', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      const findStub = sinon.stub(Group, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort:     sinon.stub().throws(new Error('DB Error')),
      });

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await getGroups(req, res);

      expect(res.status.calledWith(500)).to.be.true;

      findStub.restore();
    });
  });

  // Test Case 3: Create Group - Success
  describe('createGroup', () => {
    it('should create a group and return 201', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          name:        'Brisbane Flat',
          description: 'Shared house expenses',
          icon:        '🏠',
        },
      };

      const createdGroup = {
        _id:       new mongoose.Types.ObjectId(),
        createdBy: req.user.id,
        members:   [req.user.id],
        ...req.body,
      };

      const createStub = sinon.stub(Group, 'create').resolves(createdGroup);

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await createGroup(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdGroup)).to.be.true;

      createStub.restore();
    });

    // Test Case 4: Create Group - Error
    it('should return 500 if group creation fails', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { name: 'Test Group' },
      };

      const createStub = sinon.stub(Group, 'create').throws(new Error('DB Error'));

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await createGroup(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      createStub.restore();
    });
  });

  // Test Case 5: Update Group - Success
  describe('updateGroup', () => {
    it('should update a group and return updated data', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const req    = {
        params: { id: mockId },
        body:   { name: 'Updated Flat Name', icon: '🏡' },
      };

      const mockGroup = {
        _id:         mockId,
        name:        'Brisbane Flat',
        description: 'Old description',
        icon:        '🏠',
        save:        sinon.stub().resolves({ _id: mockId, name: 'Updated Flat Name', icon: '🏡' }),
      };

      const findStub = sinon.stub(Group, 'findById').resolves(mockGroup);

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await updateGroup(req, res);

      expect(res.json.calledOnce).to.be.true;

      findStub.restore();
    });

    // Test Case 6: Update Group - Not Found
    it('should return 404 if group is not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };

      const findStub = sinon.stub(Group, 'findById').resolves(null);

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await updateGroup(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Group not found' })).to.be.true;

      findStub.restore();
    });
  });

  // Test Case 7: Delete Group - Success
  describe('deleteGroup', () => {
    it('should delete a group and return success message', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };

      const mockGroup = {
        _id:       req.params.id,
        deleteOne: sinon.stub().resolves(),
      };

      const findStub = sinon.stub(Group, 'findById').resolves(mockGroup);

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await deleteGroup(req, res);

      expect(res.json.calledWithMatch({ message: 'Group deleted successfully' })).to.be.true;

      findStub.restore();
    });

    // Test Case 8: Delete Group - Not Found
    it('should return 404 if group to delete is not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };

      const findStub = sinon.stub(Group, 'findById').resolves(null);

      const res = {
        status: sinon.stub().returnsThis(),
        json:   sinon.spy(),
      };

      await deleteGroup(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Group not found' })).to.be.true;

      findStub.restore();
    });
  });

});
