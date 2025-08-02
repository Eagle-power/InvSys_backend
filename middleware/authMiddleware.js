const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const protect = async (req, res, next) => {
  let token;

  // Check if the header starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID and attach it to the request object
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move on to the next piece of middleware or the route handler
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// middleware to check for admin role...
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    res.status(403);
    throw new Error('User not authorized as ADMIN')
  }
}

const manager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next(); // User is a manager or an admin, proceed
  } else {
    res.status(403); // 403 Forbidden
    throw new Error('Not authorized as a manager or admin');
  }
};

module.exports = {
  protect,
  admin,
  manager

};