// Profile Routes
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');

router.get('/',                auth, getProfile);
router.put('/',                auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
