// Split Strategies - Strategy Design Pattern
//
// PATTERN: Strategy
// WHAT IT DOES: Defines a family of algorithms (splitting methods), encapsulates each one,
// and makes them interchangeable. The controller doesn't know which strategy is used —
// it just calls strategy.calculate() and gets the result.
//
// WHY WE USE IT: Without this pattern, every controller that splits expenses would need
// a big if/else block to handle equal, percentage, and exact splits. If we added a new
// split type, we'd need to change the controller. With Strategy, we just add a new class.
//
// OOP PRINCIPLE: Polymorphism - all three strategies have the same calculate() method
// but each one works differently. The controller calls the same method regardless.

// ── Base Strategy (Abstraction) ──────────────────────────────
// OOP Principle: Abstraction - defines the interface, hides the implementation
class SplitStrategy {
  // All strategies must implement this method
  calculate(amount, members) {
    throw new Error('calculate() must be implemented by subclass');
  }
}

// ── Strategy 1: Equal Split ───────────────────────────────────
// Everyone pays the same amount
class EqualSplitStrategy extends SplitStrategy {
  calculate(amount, members) {
    if (!members || members.length === 0) return [];
    const share = parseFloat((amount / members.length).toFixed(2));
    return members.map((member) => ({ member, amount: share }));
  }
}

// ── Strategy 2: Percentage Split ─────────────────────────────
// Each member pays a percentage of the total
// members = [{ name: 'Alex', percentage: 50 }, { name: 'Jessica', percentage: 50 }]
class PercentageSplitStrategy extends SplitStrategy {
  calculate(amount, members) {
    if (!members || members.length === 0) return [];
    return members.map((member) => ({
      member: member.name,
      amount: parseFloat(((amount * member.percentage) / 100).toFixed(2)),
    }));
  }
}

// ── Strategy 3: Exact Split ───────────────────────────────────
// Each member pays a specific exact amount that is provided
// members = [{ name: 'Alex', amount: 30 }, { name: 'Jessica', amount: 34 }]
class ExactSplitStrategy extends SplitStrategy {
  calculate(amount, members) {
    if (!members || members.length === 0) return [];
    return members.map((member) => ({
      member: member.name,
      amount: parseFloat(member.amount.toFixed(2)),
    }));
  }
}

// ── Factory for Strategies ────────────────────────────────────
// PATTERN: Factory (also used here)
// Takes a split type string and returns the right strategy object
// The caller doesn't need to know which class to instantiate
const getSplitStrategy = (splitType) => {
  switch (splitType) {
    case 'equal':
      return new EqualSplitStrategy();
    case 'percentage':
      return new PercentageSplitStrategy();
    case 'exact':
      return new ExactSplitStrategy();
    default:
      // Default to equal split if nothing specified
      return new EqualSplitStrategy();
  }
};

module.exports = { getSplitStrategy, EqualSplitStrategy, PercentageSplitStrategy, ExactSplitStrategy };