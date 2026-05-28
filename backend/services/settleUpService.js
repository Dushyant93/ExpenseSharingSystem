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

const Expense    = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Group      = require('../models/Group');

class SettleUpService {

  async calculateGroupBalances(groupId) {
    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name')
      .sort({ date: -1 });

    const settlements = await Settlement.find({ groupId })
      .populate('paidBy', 'name')
      .populate('paidTo', 'name');

    const balanceMap = {};

    expenses.forEach((expense) => {
      const payerName = expense.paidBy.name;

      const hasSplitResult = expense.splitResult && expense.splitResult.length > 0;

      if (hasSplitResult && expense.splitType !== 'equal') {
        // Percentage or exact split — use the stored splitResult
        expense.splitResult.forEach((split) => {
          if (split.member === payerName) {
            // Payer covered full amount but only owes their own share
            balanceMap[payerName] = (balanceMap[payerName] || 0) + expense.amount - split.amount;
          } else {
            balanceMap[split.member] = (balanceMap[split.member] || 0) - split.amount;
          }
        });
      } else {
        // Equal split
        const splitCount    = expense.splitBetween.length || 1;
        const sharePerPerson = expense.amount / splitCount;

        balanceMap[payerName] = (balanceMap[payerName] || 0) + expense.amount - sharePerPerson;

        expense.splitBetween.forEach((memberName) => {
          if (memberName !== payerName) {
            balanceMap[memberName] = (balanceMap[memberName] || 0) - sharePerPerson;
          }
        });
      }
    });

    settlements.forEach((settlement) => {
      const payerName = settlement.paidBy.name;
      const payeeName = settlement.paidTo.name;
      balanceMap[payerName] = (balanceMap[payerName] || 0) + settlement.amount;
      balanceMap[payeeName] = (balanceMap[payeeName] || 0) - settlement.amount;
    });

    return {
      expenses,
      settlements,
      balances: balanceMap,
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }

  async getGroupSummary(groupId) {
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) return null;

    const expenses    = await Expense.find({ groupId });
    const settlements = await Settlement.find({ groupId });

    return {
      group,
      memberCount:     group.members.length,
      expenseCount:    expenses.length,
      settlementCount: settlements.length,
      totalSpent:      expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }
}

module.exports = new SettleUpService();
