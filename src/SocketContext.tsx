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

export default SocketContext;