// Settlement Routes
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createSettlement, getSettlementsByGroup, getGroupBalances, deleteSettlement } = require('../controllers/settlementController');

router.post('/',                      auth, validate(['groupId', 'paidTo', 'amount']), createSettlement);
router.get('/group/:groupId',         auth, getSettlementsByGroup);
router.get('/balances/:groupId',      auth, getGroupBalances);
router.delete('/:id',                 auth, deleteSettlement);

module.exports = router;
