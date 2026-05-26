// Settlement Model
// Records when one user pays back another user within a group
// OOP Principle: Encapsulation - data and validation rules are bundled together

const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    // The group this settlement belongs to
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
    },
    // The user who is paying
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Paid by is required'],
    },
    // The user who is receiving the payment
    paidTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Paid to is required'],
    },
    // How much was paid
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    // Optional note about the settlement
    note: {
      type: String,
      default: '',
    },
    // Date of the settlement
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settlement', settlementSchema);
