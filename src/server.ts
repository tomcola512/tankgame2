// import http = require('http');
import WebSocket = require('ws');
import uuid = require('uuid');
import models = require('./models');


const port: number = parseInt(process.env.PORT) || 8878;
// const server = http.createServer();
const wss = new WebSocket.Server({
    // noServer: true
    port
});

const DRIVER_UUID = uuid.v4();

console.log("DRIVER UUID = ");
console.log(DRIVER_UUID);

const GUNNER_UUID = uuid.v4();

console.log("GUNNER UUID = ");
console.log(GUNNER_UUID);
console.log();

const buildClient = (name = 'bob', uuid = DRIVER_UUID, {target = 'ws://localhost:8878'} = {}) => {
    const socket = new WebSocket(target);
    const authenticate = msg => ({...msg, token: uuid});
    socket.onopen = event => {
        socket.send(JSON.stringify(authenticate({name, message: 'CONNECTED'})));
    }
    socket.onmessage = (event) => {
        if(event.data === "BEEP") {
            console.log("heartbeat received");
        } else {
            const { data: {name, message} } = JSON.parse(event.data.toString());
            console.log(name,  "RECEIVED FROM " + name +": ", message);
        }
    }
    return {
        sendMessage: message => socket.send(JSON.stringify(authenticate({name, message})))
    }
};

const setupWebSocket = ws => {
    ws.on('message', event => {
        console.log("HANDLING MESSAGE");
        try {
            const { token, name, message } = JSON.parse(event.toString());
            if(token != DRIVER_UUID && token != GUNNER_UUID) {
                // you mean there's a better way?
                ws.close();
                return;
            }
            const userMessage: models.UserMessage = new models.UserMessage(name, message);
            broadcast(JSON.stringify(userMessage));
        } catch (e) {
            console.log("ERROR LMAO");
            console.error(e.message);
        }
    });
};
wss.on('connection', setupWebSocket);

// server.on('upgrade', function upgrade(request, socket, head, ...args) {
//     console.log('beeeeep');
//     debugger;
//     wss.handleUpgrade(request, socket, head, ws => {
//         setupWebSocket(ws);
//     })
// });
// server.listen(port);

setInterval(() => broadcast("BEEP"), 1337);

const broadcast = (data: string): void => {
    wss.clients.forEach(client => {
        client.send(data);
    });
};
console.log('Server is running on port', port);