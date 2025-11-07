const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    return user ? { id: user.id, role: user.role, email: user.email } : null;
  } catch {
    return null;
  }
};
