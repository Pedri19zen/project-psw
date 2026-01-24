const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  // Get token from header 
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Extract the actual token string
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo_jwt");
    
    //Attach user info to the request object
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const isAdminOrStaff = (req, res, next) => {
  const role = req.user.role?.toLowerCase(); // Case-insensitive check
  if (role === 'admin' || role === 'staff' || role === 'mechanic') {
    return next();
  }
  return res.status(403).json({ msg: 'Acesso negado. Apenas para Admin ou Staff.' });
};

module.exports = { verifyToken, isAdmin: isAdminOrStaff }; 
