const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET).id;
  } catch {
    return null;
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Token invalid or expired' });
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
  getUserIdFromRequest,
};
