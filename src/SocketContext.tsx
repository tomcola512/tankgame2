import React from 'react';


export interface SocketWrapper {
    sendMessage(type: string, payload: string): void
    addMessageHandler(messageHandler: (message: TG2Event) => void, type: string): void
    removeMessageHandler(messageHandler: (message: TG2Event) => void, type: string): void
}

export interface TG2Event {
    type: string, // categorization
    name: string, // sortof used as userID
    payload: string // payload
}

export const SocketContext = React.createContext({} as SocketWrapper);

export const buildClient = (name = 'bob', uuid: String, onClose: (event: Event) => void): SocketWrapper => {
    const target = 'ws://localhost:8878';
    const socket = new WebSocket(target);
    const authenticate = (msg: any): any => ({ ...msg, token: uuid });

    socket.onclose = event => {
        onClose(event);
    }
    socket.onopen = event => {
        socket.send(JSON.stringify(authenticate({ type: 'system', name, payload: 'CONNECTED' })));
    }

    type MessageHandler = (messageHandler: TG2Event) => void;

    let messageHandlers: Map<string, MessageHandler[]> = new Map<string, MessageHandler[]>();
    socket.onmessage = (event: MessageEvent<any>) => {
        if (event.data === "BEEP") {
            console.log("heartbeat received");
        } else {
            console.log("RECV MSG");
            const { data: { name, payload, type } } = JSON.parse(event.data.toString());
            const typedHandlers = messageHandlers.get(type) || [];
            if (typedHandlers.length > 0) {
                typedHandlers.forEach(handler => handler({ type, name, payload }));
            } else {
                //LOG DEAD LETTER
                console.log("DEAD LETTER: " + event.data);
            }
        }
    }
    return {
        sendMessage: (type: string, payload: string) => socket.send(JSON.stringify(authenticate({ type, name, payload } as TG2Event))),
        addMessageHandler: (messageHandler: (tg2Event: TG2Event) => void, type: string): void => { // TODO kinda gross
            if (messageHandlers.get(type) == null) {
                messageHandlers.set(type, []);
            }
            messageHandlers.get(type)?.push(messageHandler);
        },
        removeMessageHandler: (messageHandler: (tg2Event: TG2Event) => void, type: string): void => { // TODO kinda gross
            if (messageHandlers.get(type) != null) {
                const nextHandlers = messageHandlers.get(type)?.filter(mH => mH !== messageHandler) ?? [];
                if (nextHandlers.length > 0) {
                    messageHandlers.delete(type);
                } else {
                    messageHandlers.set(type, nextHandlers);
                }
            }
        }
    }
};

export default SocketContext;