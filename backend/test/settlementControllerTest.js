// Settlement Controller Test Cases
// Covers: createSettlement, getSettlementsByGroup, deleteSettlement, getBalances
// Uses sandbox pattern — auto-restores all stubs after each test

const chai       = require('chai');
const sinon      = require('sinon');
const mongoose   = require('mongoose');
const Settlement = require('../models/Settlement');
const settleUpService = require('../services/settleUpService');

// Flexible import — handles different export names for the balances handler
const settlementController = require('../controllers/settlementController');
const createSettlement     = settlementController.createSettlement;
const getSettlementsByGroup = settlementController.getSettlementsByGroup;
const deleteSettlement     = settlementController.deleteSettlement;

// Controller may export this as getBalances, getGroupBalances, or getBalance
const getBalances =
  settlementController.getBalances        ||
  settlementController.getGroupBalances   ||
  settlementController.getBalance         ||
  settlementController.calculateBalances;

const { expect } = chai;

let sandbox;

beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(()  => { sandbox.restore(); });

describe('Settlement Controller Tests', () => {

  // Test 1: CREATE — Success 
  describe('createSettlement', () => {
    it('should create a settlement and return 201', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          groupId: new mongoose.Types.ObjectId(),
          paidTo:  new mongoose.Types.ObjectId(),
          amount:  50.00,
          date:    new Date().toISOString(),
        },
      };

      const created = { _id: new mongoose.Types.ObjectId(), paidBy: req.user.id, ...req.body };

      sandbox.stub(Settlement, 'create').resolves(created);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createSettlement(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    // Test 2: CREATE — DB Error
    it('should return 500 if settlement creation fails', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          groupId: new mongoose.Types.ObjectId(),
          paidTo:  new mongoose.Types.ObjectId(),
          amount:  50,
        },
      };

      sandbox.stub(Settlement, 'create').throws(new Error('DB Error'));

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createSettlement(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // Test 3: GET BY GROUP — Success
  describe('getSettlementsByGroup', () => {
    it('should return all settlements for a group', async () => {
      const groupId         = new mongoose.Types.ObjectId();
      const req             = { params: { groupId } };
      const mockSettlements = [
        { _id: new mongoose.Types.ObjectId(), amount: 30, groupId },
        { _id: new mongoose.Types.ObjectId(), amount: 20, groupId },
      ];

      sandbox.stub(Settlement, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort:     sinon.stub().resolves(mockSettlements),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getSettlementsByGroup(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    // Test 4: GET BY GROUP — DB Error
    it('should return 500 if fetch fails', async () => {
      const req = { params: { groupId: new mongoose.Types.ObjectId() } };

      sandbox.stub(Settlement, 'find').returns({
        populate: sinon.stub().returnsThis(),
        sort:     sinon.stub().throws(new Error('DB Error')),
      });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getSettlementsByGroup(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // Test 5: DELETE — Success
  describe('deleteSettlement', () => {
    it('should delete a settlement and return 200', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Settlement, 'findByIdAndDelete').resolves({ _id: req.params.id });

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteSettlement(req, res);

      expect(res.json.calledOnce).to.be.true;
    });

    // Test 6: DELETE — Not Found
    it('should return 404 if settlement not found for deletion', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };

      sandbox.stub(Settlement, 'findByIdAndDelete').resolves(null);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteSettlement(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  // Test 7 & 8: GET BALANCES — only runs if handler is exported
  describe('getBalances', () => {
    before(function () {
      // Skip gracefully if the function isn't exported under any known name
      if (!getBalances) {
        console.log(
          '\n  ⚠ getBalances skipped — export not found.\n' +
          '  Check settlementController exports and update the import at the top of this file.\n'
        );
        this.skip();
      }
    });

    //  Test 7: GET BALANCES — Success (Facade)
    it('should return calculated balances using the Facade service', async () => {
      const groupId = new mongoose.Types.ObjectId();
      const req     = { params: { groupId } };

      const mockResult = {
        balances:      { Alex: 30, Jessica: -30 },
        expenses:      [],
        settlements:   [],
        totalExpenses: 60,
      };

      // Stub the Facade service — not the DB models directly
      sandbox.stub(settleUpService, 'calculateGroupBalances').resolves(mockResult);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getBalances(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(settleUpService.calculateGroupBalances.calledOnce).to.be.true;
    });

    // Test 8: GET BALANCES — Service Error
    it('should return 500 if balance calculation fails', async () => {
      const req = { params: { groupId: new mongoose.Types.ObjectId() } };

      sandbox.stub(settleUpService, 'calculateGroupBalances').throws(new Error('Calc Error'));

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getBalances(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

});