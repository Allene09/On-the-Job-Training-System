const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ success: false, message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(403).json({ success: false, message: 'No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized! Invalid token.' });
    }
    req.userId = decoded.user_id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    next();
  });
};

exports.isStudent = (req, res, next) => {
  if (req.userRole === 'student') {
    next();
    return;
  }
  res.status(403).json({ success: false, message: 'Require Student Role!' });
};

exports.isStaff = (req, res, next) => {
  if (req.userRole === 'staff') {
    next();
    return;
  }
  res.status(403).json({ success: false, message: 'Require Staff Role!' });
};

exports.isAdmin = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
    return;
  }
  res.status(403).json({ success: false, message: 'Require Admin Role!' });
};

exports.isAdminOrStaff = (req, res, next) => {
  if (req.userRole === 'admin' || req.userRole === 'staff') {
    next();
    return;
  }
  res.status(403).json({ success: false, message: 'Require Admin or Staff Role!' });
};
