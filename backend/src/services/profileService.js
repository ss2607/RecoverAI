const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.updateProfile = async (userId, updateData) => {
  // Prevent updating password through this route
  if (updateData.password) {
    delete updateData.password;
  }
  return User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new Error('Incorrect old password');
  
  user.password = newPassword;
  await user.save();
  return true;
};
