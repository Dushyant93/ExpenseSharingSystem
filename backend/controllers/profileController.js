// Profile Controller
// Handles viewing and updating user profile, and changing password
// Kept separate from authController to follow Separation of Concerns (OOP principle)

const User = require('../models/User');
const bcrypt = require('bcrypt');
const ResponseFactory = require('../utils/responseFactory');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// GET PROFILE WITH ACTIVITY STATS - GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return ResponseFactory.send(res, ResponseFactory.createNotFound('User'));

    // Get activity stats for this user
    const groupCount   = await Group.countDocuments({ members: req.user.id });
    const expenseCount = await Expense.countDocuments({ paidBy: req.user.id });
    const expenses     = await Expense.find({ paidBy: req.user.id });
    const totalSpent   = expenses.reduce((sum, e) => sum + e.amount, 0);

    const profileData = {
      id:           user._id,
      name:         user.name,
      email:        user.email,
      university:   user.university,
      address:      user.address,
      stats: {
        groupCount,
        expenseCount,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
      },
    };

    return ResponseFactory.send(res, ResponseFactory.createSuccess(profileData));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// UPDATE PROFILE - PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return ResponseFactory.send(res, ResponseFactory.createNotFound('User'));

    const { name, email, university, address } = req.body;

    user.name       = name       || user.name;
    user.email      = email      || user.email;
    user.university = university || user.university;
    user.address    = address    || user.address;

    await user.save();

    return ResponseFactory.send(res, ResponseFactory.createSuccess({
      id: user._id, name: user.name, email: user.email,
      university: user.university, address: user.address,
    }, 'Profile updated'));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

// CHANGE PASSWORD - PUT /api/profile/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return ResponseFactory.send(res, ResponseFactory.createNotFound('User'));

    // Verify current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return ResponseFactory.send(res, ResponseFactory.createError('Current password is incorrect', 400));
    }

    // Set new password (pre-save hook in User model will hash it)
    user.password = newPassword;
    await user.save();

    return ResponseFactory.send(res, ResponseFactory.createSuccess(null, 'Password changed successfully'));
  } catch (error) {
    return ResponseFactory.send(res, ResponseFactory.createError(error.message));
  }
};

module.exports = { getProfile, updateProfile, changePassword };
