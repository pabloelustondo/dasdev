/** Created by pabloelustondo on 2016-11-16. */
import * as http from 'http';
import * as debug from 'debug';
var config = require('../appconfig.json');

import App from './app';

debug('ts-express:server');

const port = config.port;

App.set('port', port);

const server = http.createServer(App);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
    switch(error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    let addr = server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
    console.log("ODA started (http://localhost:" +  port.toString() +"/) ");
}
