const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getGroups, getGroupById, createGroup, updateGroup, deleteGroup,
} = require('../controllers/groupController');

router.get('/', auth, getGroups);
router.post('/', auth, createGroup);
router.get('/:id', auth, getGroupById);
router.put('/:id', auth, updateGroup);
router.delete('/:id',auth, deleteGroup);
// POST /api/groups/:id/members - add a member to a group by email
router.post('/:id/members', auth, require('../controllers/groupController').addMember);
module.exports = router;
