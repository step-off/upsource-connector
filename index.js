require('dotenv').config();
const http = require('http');
const worker = require('./src/worker');

const defaultPort = 8000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.write('OK');
  res.end();
});

server.listen(process.env.PORT || defaultPort, worker);
