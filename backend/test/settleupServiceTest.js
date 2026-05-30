// SettleUp Service Test Cases — Facade Pattern
// Tests balance calculation and group summary
// Uses sandbox pattern — auto-restores all stubs after each test

const chai            = require('chai');
const sinon           = require('sinon');
const mongoose        = require('mongoose');
const Expense         = require('../models/Expense');
const Settlement      = require('../models/Settlement');
const Group           = require('../models/Group');
const settleUpService = require('../services/settleUpService');

const { expect } = chai;

let sandbox;

beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(()  => { sandbox.restore(); });

// Helper: builds the Settlement.find() stub that chains two .populate() calls
// Service does: Settlement.find({}).populate('paidBy','name').populate('paidTo','name')
const stubSettlementFind = (sandbox, resolvedData) => {
  sandbox.stub(Settlement, 'find').returns({
    populate: sinon.stub().returns({
      populate: sinon.stub().resolves(resolvedData),
    }),
  });
};

// Helper: builds the Expense.find() stub that chains .populate().sort()
// Service does: Expense.find({}).populate('paidBy','name').sort({date:-1})
const stubExpenseFind = (sandbox, resolvedData) => {
  sandbox.stub(Expense, 'find').returns({
    populate: sinon.stub().returnsThis(),
    sort:     sinon.stub().resolves(resolvedData),
  });
};

describe('SettleUp Service Tests (Facade Pattern)', () => {

  // Test 1: calculateGroupBalances — Equal split
  describe('calculateGroupBalances', () => {
    it('should calculate correct net balances for equal split expenses', async () => {
      const groupId = new mongoose.Types.ObjectId();

      // Alex paid $90, split equally between Alex, Jessica, Marcus ($30 each)
      // Alex is owed $60 (paid $90, owes his $30 share)
      const mockExpenses = [{
        paidBy:       { _id: new mongoose.Types.ObjectId(), name: 'Alex' },
        amount:       90,
        splitType:    'equal',
        splitBetween: ['Alex', 'Jessica', 'Marcus'],
        splitResult:  [],
      }];

      stubExpenseFind(sandbox, mockExpenses);
      stubSettlementFind(sandbox, []);

      const result = await settleUpService.calculateGroupBalances(groupId);

      expect(result).to.have.property('balances');
      expect(result).to.have.property('totalExpenses', 90);
      expect(result.balances['Alex']).to.equal(60);
      expect(result.balances['Jessica']).to.equal(-30);
      expect(result.balances['Marcus']).to.equal(-30);
    });

    //  Test 2: calculateGroupBalances — Percentage split 
    it('should use splitResult for percentage split expenses', async () => {
      const groupId = new mongoose.Types.ObjectId();

      // Alex paid $100, percentage split: Alex 60%, Jessica 40%
      // Alex net: paid $100, owes $60 → owed $40 by Jessica
      const mockExpenses = [{
        paidBy:       { _id: new mongoose.Types.ObjectId(), name: 'Alex' },
        amount:       100,
        splitType:    'percentage',
        splitBetween: ['Alex', 'Jessica'],
        splitResult:  [
          { member: 'Alex',    amount: 60 },
          { member: 'Jessica', amount: 40 },
        ],
      }];

      stubExpenseFind(sandbox, mockExpenses);
      stubSettlementFind(sandbox, []);

      const result = await settleUpService.calculateGroupBalances(groupId);

      expect(result.balances['Alex']).to.equal(40);
      expect(result.balances['Jessica']).to.equal(-40);
    });

    //  Test 3: calculateGroupBalances — Settlement offsets balance
    it('should reduce balance when a settlement is recorded', async () => {
      const groupId   = new mongoose.Types.ObjectId();
      const alexId    = new mongoose.Types.ObjectId();
      const jessicaId = new mongoose.Types.ObjectId();

      // Alex paid $60, equal split — Alex owed $30 by Jessica
      const mockExpenses = [{
        paidBy:       { _id: alexId, name: 'Alex' },
        amount:       60,
        splitType:    'equal',
        splitBetween: ['Alex', 'Jessica'],
        splitResult:  [],
      }];

      // Jessica paid back $30 to Alex — balances now zero
      const mockSettlements = [{
        paidBy: { _id: jessicaId, name: 'Jessica' },
        paidTo: { _id: alexId,    name: 'Alex'    },
        amount: 30,
      }];

      stubExpenseFind(sandbox, mockExpenses);
      stubSettlementFind(sandbox, mockSettlements);

      const result = await settleUpService.calculateGroupBalances(groupId);

      expect(result.balances['Alex']).to.equal(0);
      expect(result.balances['Jessica']).to.equal(0);
    });

    //  Test 4: calculateGroupBalances — No expenses 
    it('should return empty balances and zero total when group has no expenses', async () => {
      const groupId = new mongoose.Types.ObjectId();

      stubExpenseFind(sandbox, []);
      stubSettlementFind(sandbox, []);

      const result = await settleUpService.calculateGroupBalances(groupId);

      expect(result.balances).to.deep.equal({});
      expect(result.totalExpenses).to.equal(0);
    });
  });

  //  Test 5: getGroupSummary — Success 
  describe('getGroupSummary', () => {
    it('should return correct summary counts and total', async () => {
      const groupId = new mongoose.Types.ObjectId();
      const mockGroup = {
        _id:     groupId,
        name:    'Brisbane Flat',
        members: [
          { _id: new mongoose.Types.ObjectId(), name: 'Alex'    },
          { _id: new mongoose.Types.ObjectId(), name: 'Jessica' },
        ],
      };

      const mockExpenses    = [{ amount: 60 }, { amount: 40 }];
      const mockSettlements = [{ amount: 30 }];

      // Defensive: restore any leaked stub from prior test files
      if (Group.findById.restore) Group.findById.restore();

      sandbox.stub(Group, 'findById').returns({
        populate: sinon.stub().resolves(mockGroup),
      });

      // getGroupSummary calls Expense.find and Settlement.find without chaining
      sandbox.stub(Expense,    'find').resolves(mockExpenses);
      sandbox.stub(Settlement, 'find').resolves(mockSettlements);

      const result = await settleUpService.getGroupSummary(groupId);

      expect(result.memberCount).to.equal(2);
      expect(result.expenseCount).to.equal(2);
      expect(result.settlementCount).to.equal(1);
      expect(result.totalSpent).to.equal(100);
    });

    //  Test 6: getGroupSummary — Group Not Found 
    it('should return null if group does not exist', async () => {
      const groupId = new mongoose.Types.ObjectId();

      if (Group.findById.restore) Group.findById.restore();

      sandbox.stub(Group, 'findById').returns({
        populate: sinon.stub().resolves(null),
      });

      const result = await settleUpService.getGroupSummary(groupId);

      expect(result).to.be.null;
    });
  });

});