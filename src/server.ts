import WebSocket = require('ws');
import uuid = require('uuid');
import models = require('./models');
import { Socket } from 'dgram';

const port: number = parseInt(process.env.PORT) || 8878;
const server = new WebSocket.Server({ port: port });

const DRIVER_UUID = uuid.v4();

console.log("DRIVER UUID = ");
console.log(DRIVER_UUID);

const GUNNER_UUID = uuid.v4();

console.log("GUNNER UUID = ");
console.log(GUNNER_UUID);
console.log();

// server.on('upgrade', (request, socket, head) => {
//     console.log(JSON.stringify(request));
//     const token = request?.token;
//     if(token != DRIVER_UUID && token != GUNNER_UUID) {
//         socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
//         socket.destroy();
//         return;
//     }

//     if(token == DRIVER_UUID) {
//         console.log("DRIVER CONNECTED");
//     } else {
//         console.log("GUNER_CONNECTED");
//     }

//     server.handleUpgrade(request, socket, head, connection => {
//         server.emit('connection', connection, request);
//     });
// });

const genClient = uuid => {
    const socket = new WebSocket('ws://localhost:8878');
    const authenticationMessage = {
        type: 'authenticate',
        payload: { token: 'the uuid' }
    }
    socket.onopen = event => {
        socket.send(JSON.stringify(authenticationMessage));
    }
    socket.onmessage = message => console.log(uuid, ": ", message.data);
    return socket;
}

server.on('connection', ws => {
    ws.on('authenticate', data => {
        console.log(JSON.stringify(data));
        
    })
    ws.on('message', message => {
        console.log("HANDLING MESSAGE");
        try {
            const userMessage: models.UserMessage = new models.UserMessage(""+message);
            broadcast(JSON.stringify(userMessage));
        } catch (e) {
            console.log("ERROR LMAO");
            console.error(e.message);
        }
    });
});

const broadcast = (data: string): void => {
    server.clients.forEach(client => {
        client.send(data);
    });
};

console.log('Server is running on port', port);