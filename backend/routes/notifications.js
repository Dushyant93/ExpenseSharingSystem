// Notification Routes
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { getNotifications, getUnreadCount, markAllAsRead, markAsRead } = require('../controllers/notificationController');

router.get('/',                  auth, getNotifications);
router.get('/unread-count',      auth, getUnreadCount);
router.put('/mark-all-read',     auth, markAllAsRead);
router.put('/:id/read',          auth, markAsRead);

module.exports = router;
