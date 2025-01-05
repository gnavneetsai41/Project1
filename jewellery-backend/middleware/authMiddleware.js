const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log("Received token:", token);  // Debug log

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not defined');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);  // Debug log

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log("User not found");
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // req.username = req.user.username;

    next();
  } catch (error) {
    console.error("Token verification error:", error);  // Debug log
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authMiddleware;
