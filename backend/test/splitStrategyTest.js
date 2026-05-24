// Split Strategy Test Cases
// Tests the Strategy pattern — ensures all three split algorithms work correctly

const chai = require('chai');
const { getSplitStrategy, EqualSplitStrategy, PercentageSplitStrategy, ExactSplitStrategy } = require('../utils/splitStrategies');

const { expect } = chai;

describe('Split Strategy Tests (Strategy Pattern)', () => {

  // ── Test 1: Equal Split ──────────────────────────────────────
  describe('EqualSplitStrategy', () => {
    it('should split amount equally between all members', () => {
      const strategy = new EqualSplitStrategy();
      const result   = strategy.calculate(90, ['Alex', 'Jessica', 'Marcus']);

      expect(result).to.have.lengthOf(3);
      expect(result[0].amount).to.equal(30);
      expect(result[1].amount).to.equal(30);
      expect(result[2].amount).to.equal(30);
    });

    it('should return empty array if no members', () => {
      const strategy = new EqualSplitStrategy();
      const result   = strategy.calculate(90, []);
      expect(result).to.have.lengthOf(0);
    });
  });

  // ── Test 2: Percentage Split ────────────────────────────────
  describe('PercentageSplitStrategy', () => {
    it('should split amount by percentage', () => {
      const strategy = new PercentageSplitStrategy();
      const members  = [{ name: 'Alex', percentage: 60 }, { name: 'Jessica', percentage: 40 }];
      const result   = strategy.calculate(100, members);

      expect(result[0].amount).to.equal(60);
      expect(result[1].amount).to.equal(40);
    });
  });

  // ── Test 3: Exact Split ──────────────────────────────────────
  describe('ExactSplitStrategy', () => {
    it('should use the exact amounts provided', () => {
      const strategy = new ExactSplitStrategy();
      const members  = [{ name: 'Alex', amount: 35 }, { name: 'Jessica', amount: 65 }];
      const result   = strategy.calculate(100, members);

      expect(result[0].amount).to.equal(35);
      expect(result[1].amount).to.equal(65);
    });
  });

  // ── Test 4: Factory returns correct strategy ─────────────────
  describe('getSplitStrategy (Factory)', () => {
    it('should return EqualSplitStrategy for equal', () => {
      const strategy = getSplitStrategy('equal');
      expect(strategy).to.be.instanceof(EqualSplitStrategy);
    });

    it('should return PercentageSplitStrategy for percentage', () => {
      const strategy = getSplitStrategy('percentage');
      expect(strategy).to.be.instanceof(PercentageSplitStrategy);
    });

    it('should return ExactSplitStrategy for exact', () => {
      const strategy = getSplitStrategy('exact');
      expect(strategy).to.be.instanceof(ExactSplitStrategy);
    });

    it('should default to EqualSplitStrategy for unknown type', () => {
      const strategy = getSplitStrategy('unknown');
      expect(strategy).to.be.instanceof(EqualSplitStrategy);
    });
  });

});
