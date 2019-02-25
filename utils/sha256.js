const crypto = require('crypto');

module.exports = buf => (
  crypto.createHash('sha256').update(buf).digest('hex')
);
