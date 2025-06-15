const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
const authHeader = req.headers.authorization;

if (!authHeader?.startsWith('Bearer ')) {
return res.status(401).json({ message: 'Unauthorized: No token' });
}

const token = authHeader.split(' ')[1];

try {
const decoded = jwt.verify(token, JWT_SECRET);
req.user = decoded; // Contains userId and role
next();
} catch (err) {
res.status(401).json({ message: 'Invalid token' });
}
};

const restrictTo = (...roles) => (req, res, next) => {
if (!roles.includes(req.user.role)) {
return res.status(403).json({ message: 'Forbidden: Insufficient role' });
}
next();
};

const restrictToAdmin = (req, res, next) => {
if (req.user.role !== 'ADMIN') {
return res.status(403).json({ message: 'Access denied. Admins only.' });
}
next();
};
const verifyAdmin = (req, res, next) => {
  // your logic to verify admin
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = {
protect,
restrictTo,
restrictToAdmin,
verifyAdmin,
};