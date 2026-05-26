// Settlement Controller
// Handles creating, reading settlements and calculating group balances
// Uses the Facade pattern (settleUpService) for complex balance calculations
// Uses the Factory pattern (ResponseFactory) for consistent API responses
// Uses the Observer pattern (expenseEmitter) to notify group members

const Settlement = require('../models/Settlement');
const ResponseFactory = require('../utils/responseFactory');
const settleUpService = require('../services/settleUpService');
const { expenseEmitter } = require('../utils/notificationObserver');

// CREATE SETTLEMENT - POST /api/settlements
const createSettlement = async (req, res) => {
  const { groupId, paidTo, amount, note, date } = req.body;
  try {
    const settlement = await Settlement.create({
      groupId,
      paidBy: req.user.id,
      paidTo,
      amount,
      note,
      date,
    });

    // Observer pattern: notify the person being paid
    await expenseEmitter.notify('settlement_recorded', {
      groupId,
      triggeredBy: req.user.id,
      message: `A settlement of $${amount} was recorded in your group`,
    });

    return ResponseFactory.send(res, ResponseFactory.createSuccess(settlement, 'Settlement recorded', 201));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// GET ALL SETTLEMENTS FOR A GROUP - GET /api/settlements/group/:groupId
const getSettlementsByGroup = async (req, res) => {
  try {
    const settlements = await Settlement.find({ groupId: req.params.groupId })
      .populate('paidBy', 'name')
      .populate('paidTo', 'name')
      .sort({ date: -1 });

    return ResponseFactory.send(res, ResponseFactory.createSuccess(settlements));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// GET GROUP BALANCES - GET /api/settlements/balances/:groupId
// Uses the Facade pattern - delegates complex calculation to settleUpService
const getGroupBalances = async (req, res) => {
  try {
    // Facade hides all the complex balance calculation logic
    const result = await settleUpService.calculateGroupBalances(req.params.groupId);
    return ResponseFactory.send(res, ResponseFactory.createSuccess(result));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// DELETE SETTLEMENT - DELETE /api/settlements/:id
const deleteSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findByIdAndDelete(req.params.id);
    if (!settlement) {
      return ResponseFactory.send(res, ResponseFactory.createNotFound('Settlement'));
    }
    return ResponseFactory.send(res, ResponseFactory.createSuccess(null, 'Settlement deleted'));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

module.exports = { createSettlement, getSettlementsByGroup, getGroupBalances, deleteSettlement };
