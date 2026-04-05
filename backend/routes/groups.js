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

module.exports = router;
