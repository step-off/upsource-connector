const Logger = require('../services/Logger');

module.exports = function (req, res) {
  Logger.log('Ping!');
  res.writeHead(200);
  res.write('OK');
  res.end();
};
