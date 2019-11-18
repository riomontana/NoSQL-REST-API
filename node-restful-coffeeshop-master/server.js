const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000; //The port where the project runs

const server = http.createServer(app); // passing app (app qualifies as a request handler)

server.listen(port); //starting the server