const fs = require('fs');
const path = require('path');

exports.auditTrail = (actionType) => (req, res, next) => {
  const oldSend = res.send;

  res.send = function (body) {
    const logPath = path.join(__dirname, '../logs/audit-trail.txt');
    const logData = `${new Date().toISOString()} | ${req.user?.id || 'unknown'} | ${actionType} | ${req.originalUrl} | IP: ${req.ip}\n`;
    fs.appendFileSync(logPath, logData);
    oldSend.call(this, body);
  };

  next();
};
