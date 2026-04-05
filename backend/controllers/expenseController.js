const Expense = require('../models/Expense');

// CREATE - POST /api/expenses
const createExpense = async (req, res) => {
  const { groupId, description, amount, category, date } = req.body;
  try {
    const expense = await Expense.create({
      paidBy: req.user.id,
      groupId,
      description,
      amount,
      category,
      date,
      splitBetween
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ALL EXPENSES - GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ paidBy: req.user.id })
                                  .sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE - GET /api/expenses/:id
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('groupId');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE - PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  const { description, amount, category, date } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Only update those fields that were sent in the request
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE - DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense };