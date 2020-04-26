require('dotenv').config();
const http = require('http');
const worker = require('./src/worker');

const defaultPort = 8000;
const server = http.createServer();

server.listen(process.env.PORT || defaultPort, worker);
