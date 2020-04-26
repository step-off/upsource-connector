require('dotenv').config();
const http = require('http');
const worker = require('./src/worker');
const requestHandler = require('./src/handlers/requestHandler');

const defaultPort = 8000;
const server = http.createServer(requestHandler);

server.listen(process.env.PORT || defaultPort, worker);
