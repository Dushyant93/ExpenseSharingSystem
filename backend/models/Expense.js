const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'General' },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupName: { type: String, required: true },
  splitBetween: [{ type: String }],
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);