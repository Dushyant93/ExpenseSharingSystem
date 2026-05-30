// Expense Controller Test Cases
// Fixed: stubs Observer to prevent real DB calls, fixed populate chain, fixed assertions

const chai   = require('chai');
const sinon  = require('sinon');
const mongoose = require('mongoose');
const Expense  = require('../models/Expense');
const { expenseEmitter } = require('../utils/notificationObserver');
const { getExpenseById } = require('../controllers/expenseController');
const {
  createExpense, getExpenses, updateExpense, deleteExpense
} = require('../controllers/expenseController');

const { expect } = chai;

//  Shared sandbox - restores ALL stubs after each test automatically
let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
  // CRITICAL: stub the Observer notify so it never touches the real database
  sandbox.stub(expenseEmitter, 'notify').resolves();
});

afterEach(() => {
  // Restores every stub created in this sandbox — prevents "already wrapped" errors
  sandbox.restore();
});

describe('Expense Controller Tests', () => {

  //  Test 1: CREATE — Success 
  describe('createExpense', () => {
    it('should create an expense and return 201', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          groupId:      new mongoose.Types.ObjectId(),
          description:  'Woolies groceries',
          amount:       64.00,
          category:     'Groceries',
          splitBetween: ['dushyant_s', 'rik_v', 'sam_j'],
        },
      };

      const createdExpense = { _id: new mongoose.Types.ObjectId(), ...req.body, paidBy: req.user.id };

      // Use sandbox.stub instead of sinon.stub — auto-restored in afterEach
      sandbox.stub(Expense, 'create').resolves(createdExpense);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createExpense(req, res);

      // ResponseFactory wraps response so check status and json called
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 2: CREATE — DB Error 
    it('should return 500 if creation fails', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { description: 'Test', amount: 10, groupId: new mongoose.Types.ObjectId() },
      };

      sandbox.stub(Expense, 'create').throws(new Error('DB Error'));

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createExpense(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  //  Test 3: READ ALL — Success 
  describe('getExpenses', () => {
    it('should return all expenses for logged-in user', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      const mockExpenses = [
        { description: 'Groceries', amount: 64 },
        { description: 'Pizza',     amount: 45 },
      ];

      // Must include .populate chain — getExpenses now calls .populate().sort()
      sandbox.stub(Expense, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort:     sinon.stub().resolves(mockExpenses),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getExpenses(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 4: READ ALL — DB Error 
    it('should return 500 if fetch fails', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Expense, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort:     sinon.stub().throws(new Error('DB Error')),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getExpenses(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  //  Test 5: UPDATE — Success 
  describe('updateExpense', () => {
    it('should update an expense and return 200', async () => {
      const mockId = new mongoose.Types.ObjectId();
      const req    = { params: { id: mockId }, body: { amount: 75.00 } };

      const updatedExpense = { _id: mockId, amount: 75.00, description: 'Groceries' };

      sandbox.stub(Expense, 'findByIdAndUpdate').resolves(updatedExpense);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateExpense(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 6: UPDATE — Not Found ─
    it('should return 404 if expense not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };

      sandbox.stub(Expense, 'findByIdAndUpdate').resolves(null);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateExpense(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  //  Test 7: DELETE — Success 
  describe('deleteExpense', () => {
    it('should delete an expense and return 200', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Expense, 'findByIdAndDelete').resolves({ _id: req.params.id });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteExpense(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    //  Test 8: DELETE — Not Found 
    it('should return 404 if expense not found for deletion', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Expense, 'findByIdAndDelete').resolves(null);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteExpense(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

});

describe('getExpenseById', () => {
 
  it('should return a single expense by ID', async () => {
    const mockId      = new mongoose.Types.ObjectId();
    const req         = { params: { id: mockId } };
    const mockExpense = { _id: mockId, description: 'Woolies groceries', amount: 64 };
 
    sandbox.stub(Expense, 'findById').returns({
      populate: sinon.stub().resolves(mockExpense),
    });
 
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await getExpenseById(req, res);
 
    expect(res.json.calledOnce).to.be.true;
  });
 
  it('should return 404 if expense does not exist', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId() } };
 
    sandbox.stub(Expense, 'findById').returns({
      populate: sinon.stub().resolves(null),
    });
 
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await getExpenseById(req, res);
 
    expect(res.status.calledWith(404)).to.be.true;
  });
});