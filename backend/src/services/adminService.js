const User = require('../models/User');
const Claim = require('../models/Claim');
const Item = require('../models/Item');

exports.getDashboardStats = async () => {
  const usersCount = await User.countDocuments();
  const itemsCount = await Item.countDocuments();
  const claimsCount = await Claim.countDocuments();
  
  return { usersCount, itemsCount, claimsCount };
};

exports.getUsers = async () => {
  return User.find().select('-password');
};

exports.getClaims = async () => {
  return Claim.find().populate('item').populate('claimant');
};
