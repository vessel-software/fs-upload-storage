const mkdirpImpl = require('mkdirp');
const { promisify } = require('util');

module.exports = promisify(mkdirpImpl);
