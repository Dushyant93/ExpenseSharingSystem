// SettleUp Service - Facade Design Pattern
//
// PATTERN: Facade
// WHAT IT DOES: Provides a simple interface to a complex set of operations.
// Instead of controllers calling Expense, Group, Settlement models directly
// and doing calculations themselves, they call this service which handles everything.
//
// WHY WE USE IT: The balance calculation involves querying expenses, grouping by user,
// subtracting settlements — this is complex logic. Without Facade, this code would
// be repeated in every controller that needs balances. With Facade, it lives in one place.
//
// OOP PRINCIPLE: Abstraction - controllers don't know how balances are calculated,
// they just call calculateGroupBalances(groupId) and get the result.
//
// OOP PRINCIPLE: Separation of Concerns - business logic lives in the service,
// not in the controller or the model.

const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

class SettleUpService {

  // ── Calculate balances for a group ───────────────────────────
  // Returns who owes whom and how much
  async calculateGroupBalances(groupId) {
    // Step 1: Get all expenses for this group
    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name')
      .sort({ date: -1 });

    // Step 2: Get all settlements for this group
    const settlements = await Settlement.find({ groupId })
      .populate('paidBy', 'name')
      .populate('paidTo', 'name');

    // Step 3: Build a balance map { userId: netAmount }
    // Positive = owed money, Negative = owes money
    const balanceMap = {};

    // Add expenses to the balance map
    expenses.forEach((expense) => {
      const payerId = expense.paidBy._id.toString();
      const splitCount = expense.splitBetween.length || 1;
      const sharePerPerson = expense.amount / splitCount;

      // Payer is owed money from others
      balanceMap[payerId] = (balanceMap[payerId] || 0) + expense.amount - sharePerPerson;

      // Others owe the payer
      expense.splitBetween.forEach((memberName) => {
        if (memberName !== expense.paidBy.name) {
          // We use name as key here since splitBetween stores names
          balanceMap[memberName] = (balanceMap[memberName] || 0) - sharePerPerson;
        }
      });
    });

    // Subtract settlements from the balance map
    settlements.forEach((settlement) => {
      const payerId = settlement.paidBy._id.toString();
      const payeeId = settlement.paidTo._id.toString();
      balanceMap[payerId] = (balanceMap[payerId] || 0) + settlement.amount;
      balanceMap[payeeId] = (balanceMap[payeeId] || 0) - settlement.amount;
    });

    return {
      expenses,
      settlements,
      balances: balanceMap,
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }

  // ── Get group summary ─────────────────────────────────────────
  // Returns a summary with member count, expense count, and total amount
  async getGroupSummary(groupId) {
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) return null;

    const expenses = await Expense.find({ groupId });
    const settlements = await Settlement.find({ groupId });

    return {
      group,
      memberCount: group.members.length,
      expenseCount: expenses.length,
      settlementCount: settlements.length,
      totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }
}

// Export a single instance (also demonstrates Singleton)
module.exports = new SettleUpService();
