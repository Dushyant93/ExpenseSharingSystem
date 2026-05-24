// Notification Controller
// Handles reading and marking notifications as read
// Notifications are created automatically by the Observer pattern in notificationObserver.js

const Notification = require('../models/Notification');
const ResponseFactory = require('../utils/responseFactory');

// GET ALL NOTIFICATIONS FOR LOGGED-IN USER - GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // limit to last 50 notifications

    return ResponseFactory.send(res, ResponseFactory.createSuccess(notifications));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// GET UNREAD COUNT - GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    return ResponseFactory.send(res, ResponseFactory.createSuccess({ count }));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// MARK ALL AS READ - PUT /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    return ResponseFactory.send(res, ResponseFactory.createSuccess(null, 'All notifications marked as read'));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// MARK ONE AS READ - PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return ResponseFactory.send(res, ResponseFactory.createNotFound('Notification'));
    }

    return ResponseFactory.send(res, ResponseFactory.createSuccess(notification));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

module.exports = { getNotifications, getUnreadCount, markAllAsRead, markAsRead };
