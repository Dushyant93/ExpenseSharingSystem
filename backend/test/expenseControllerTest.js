const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const {
  createExpense, getExpenses, updateExpense, deleteExpense
} = require('../controllers/expenseController');

const { expect } = chai;

describe('Expense Controller Tests', () => {

  // Test 1: CREATE
  describe('createExpense', () => {
    it('should create an expense and return 201', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
            groupId: new mongoose.Types.ObjectId(),
            description: 'Woolies groceries',
            amount: 64.00,
            category: 'Groceries',
            groupName: 'Brisbane Flat',
            splitBetween: ['dushyant_s', 'rik_v', 'sam_j'],
        },
      };
      const createdExpense = { _id: new mongoose.Types.ObjectId(), ...req.body, paidBy: req.user.id };
      const createStub = sinon.stub(Expense, 'create').resolves(createdExpense);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createExpense(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdExpense)).to.be.true;
      createStub.restore();
    });

    // Test 2: CREATE - error test
    it('should return 500 if creation fails', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { description: 'Test', amount: 10, groupName: 'Test Group' },
      };
      const createStub = sinon.stub(Expense, 'create').throws(new Error('DB Error'));
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createExpense(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      createStub.restore();
    });
  });

  // Test 3: READ 
  describe('getExpenses', () => {
    it('should return all expenses for logged-in user', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const mockExpenses = [
        { description: 'Groceries', amount: 64, groupName: 'Brisbane Flat' },
        { description: 'Pizza', amount: 45, groupName: 'Friday Dinners' },
      ];
      const findStub = sinon.stub(Expense, 'find').returns({
        sort: sinon.stub().resolves(mockExpenses),
      });
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getExpenses(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockExpenses)).to.be.true;
      findStub.restore();
    });

    // Test 3: READ - error test
    it('should return 500 if fetch fails', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const findStub = sinon.stub(Expense, 'find').returns({
        sort: sinon.stub().throws(new Error('DB Error')),
      });
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getExpenses(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      findStub.restore();
    });
  });

  // Test 4: UPDATE
  describe('updateExpense', () => {
    it('should update an expense and return 200', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const req = { params: { id: mockId }, body: { amount: 75.00 } };
      const updatedExpense = { _id: mockId, amount: 75.00, description: 'Groceries' };
      const updateStub = sinon.stub(Expense, 'findByIdAndUpdate').resolves(updatedExpense);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateExpense(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(updatedExpense)).to.be.true;
      updateStub.restore();
    });

    // Test 4: UPDATE - update test
    it('should return 404 if expense not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const updateStub = sinon.stub(Expense, 'findByIdAndUpdate').resolves(null);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateExpense(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      updateStub.restore();
    });
  });

  // Test 4: DELETE
  describe('deleteExpense', () => {
    it('should delete an expense and return 200', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      const deleteStub = sinon.stub(Expense, 'findByIdAndDelete').resolves({ _id: req.params.id });
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteExpense(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      deleteStub.restore();
    });

    // Test 4: DELETE - test
    it('should return 404 if expense not found for deletion', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      const deleteStub = sinon.stub(Expense, 'findByIdAndDelete').resolves(null);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteExpense(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      deleteStub.restore();
    });
  });

});