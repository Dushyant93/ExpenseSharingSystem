// Notification Model
// Stores notifications for users when expenses are added or settlements are recorded
// OOP Principle: Encapsulation - notification structure is defined and validated here

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Who this notification is for
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The message to show
    message: {
      type: String,
      required: true,
    },
    // Type of notification
    type: {
      type: String,
      enum: ['expense_added', 'expense_updated', 'expense_deleted', 'settlement_recorded'],
      default: 'expense_added',
    },
    // Whether the user has read this notification
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
