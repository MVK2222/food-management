const fs = require('fs');
const path = require('path');

exports.adminLogger = (req, res, next) => {
  if (req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN') {
    const logPath = path.join(__dirname, '../logs/admin-log.txt');
    const logData = `${new Date().toISOString()} | ${req.user.id} | ${req.method} ${req.originalUrl} | IP: ${req.ip}\n`;
    fs.appendFileSync(logPath, logData);
  }
  next();
};
