const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense
} = require('../controllers/expenseController');

router.post('/', auth, createExpense);
router.get('/', auth, getExpenses);
router.get('/:id', auth, getExpenseById);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;