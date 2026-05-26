//   1. Uses ResponseFactory (Factory pattern) for consistent responses
//   2. Uses getSplitStrategy (Strategy pattern) to calculate splits
//   3. Uses expenseEmitter (Observer pattern) to notify group members

const Expense = require('../models/Expense');
const ResponseFactory = require('../utils/responseFactory');
const { getSplitStrategy } = require('../utils/splitStrategies');
const { expenseEmitter } = require('../utils/notificationObserver');

// CREATE - POST /api/expenses
const createExpense = async (req, res) => {
  const { groupId, description, amount, category, date, splitBetween, splitType, members } = req.body;
  try {
    // Strategy Pattern: choose the split algorithm based on splitType
    // Default is 'equal' — everyone pays the same amount
    const strategy = getSplitStrategy(splitType || 'equal');
    const splitResult = strategy.calculate(amount, members || splitBetween || []);

    const expense = await Expense.create({
      paidBy: req.user.id,
      groupId,
      description,
      amount,
      category,
      date,
      splitBetween: splitBetween || [],
      splitType:    splitType    || 'equal',
      splitResult,
    });

    // Observer Pattern: notify all group members about the new expense
    await expenseEmitter.notify('expense_added', {
      groupId,
      triggeredBy: req.user.id,
      message: `New expense added: ${description} - $${amount}`,
    });

    return ResponseFactory.send(res, ResponseFactory.createSuccess(expense, 'Expense created', 201));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// READ ALL - GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ paidBy: req.user.id })
    .populate('groupId', 'name icon')
    .sort({ date: -1 });
    return ResponseFactory.send(res, ResponseFactory.createSuccess(expenses));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// READ ONE - GET /api/expenses/:id
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('groupId');
    if (!expense) return ResponseFactory.send(res, ResponseFactory.createNotFound('Expense'));
    return ResponseFactory.send(res, ResponseFactory.createSuccess(expense));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// UPDATE - PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!expense) return ResponseFactory.send(res, ResponseFactory.createNotFound('Expense'));

    // Observer Pattern: notify group members about the update
    await expenseEmitter.notify('expense_updated', {
      groupId:     expense.groupId,
      triggeredBy: req.user.id,
      message:     `Expense updated: ${expense.description}`,
    });

    return ResponseFactory.send(res, ResponseFactory.createSuccess(expense, 'Expense updated'));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// DELETE - DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return ResponseFactory.send(res, ResponseFactory.createNotFound('Expense'));

    // Observer Pattern: notify group members about the deletion
    await expenseEmitter.notify('expense_deleted', {
      groupId:     expense.groupId,
      triggeredBy: req.user.id,
      message:     `An expense was deleted: ${expense.description}`,
    });

    return ResponseFactory.send(res, ResponseFactory.createSuccess(null, 'Expense deleted'));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense };