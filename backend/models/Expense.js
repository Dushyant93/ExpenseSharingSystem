const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['Groceries', 'Dining', 'Transport', 'Utilities', 'Entertainment', 'Travel', 'General'], default: 'General' },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  splitBetween: [{ type: String }],
  //which split strategy was used
  splitType: {
      type: String,
      enum: ['equal', 'percentage', 'exact'],
      default: 'equal',
    },

    //the calculated result from the split strategy
    splitResult: [
      {
        member: { type: String },
        amount: { type: Number },
      },
    ],
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);