import React, { useCallback, useState } from 'react';
import SocketContext, { SocketWrapper, TG2Event } from './SocketContext';
import Chat from './Chat';
import Game from './Game';

function App() {
  const [name, setName] = useState("");
  const [uuid, setUuid] = useState("");

  const [chatLog, setChatLog] = useState([] as any[]);

  const [webSocket, setWebSocket] = useState({} as SocketWrapper);
  const submit = useCallback(() => {
    const socket = buildClient(name, uuid);
    setWebSocket(socket);
  }, [name, uuid, chatLog]);
  return (
    <div className="App">
      {Object.keys(webSocket).length == 0
        ? <>
          <div>ENTER AUTH UUID: <input onChange={(event) => setUuid(event.target.value)}></input></div>
          <div>ENTER NAME: <input onChange={(event) => setName(event.target.value)}></input></div>
          <div><button onClick={submit}>LOGIN</button></div>
        </>
        :
        <SocketContext.Provider value={webSocket}>
          <div style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            display: 'grid',
            grid: `
            'TITLE CHATLOG'
            'GAME CHATLOG'
            'GAME INPUT'
          `,
            gridTemplateRows: 'min-content 1fr min-content',
            gridTemplateColumns: '1fr min-content',
            overflow: 'hidden'
          }}>
            <div style={{ gridArea: 'TITLE', backgroundColor: 'white', color: 'red' }}>
              TANKGAME 2
            </div>
            <Game />
            <Chat />
          </div>
        </SocketContext.Provider>
      }
    </div>
  );
}

const buildClient = (name = 'bob', uuid: String, { target = 'ws://localhost:8878' } = {}): SocketWrapper => {
  const socket = new WebSocket(target);
  const authenticate = (msg: any): any => ({ ...msg, token: uuid });
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
      if(typedHandlers.length > 0) {
        typedHandlers.forEach(handler => handler({type, name, payload}));
      } else {
        //LOG DEAD LETTER
        console.log("DEAD LETTER: " + event.data);
      }
    }
  }
  return {
    sendMessage: (type: string, payload: string) => socket.send(JSON.stringify(authenticate({ type, name, payload } as TG2Event))),
    addMessageHandler: (messageHandler: (tg2Event: TG2Event) => void, type: string): void => { // TODO kinda gross
      if(messageHandlers.get(type) == null) {
        messageHandlers.set(type, []);
      }
      messageHandlers.get(type)?.push(messageHandler);
    },
    removeMessageHandler: (messageHandler: (tg2Event: TG2Event) => void, type: string): void => { // TODO kinda gross
      if(messageHandlers.get(type) != null) {
        const nextHandlers = messageHandlers.get(type)?.filter(mH => mH !== messageHandler) ?? [];
        if(nextHandlers.length > 0) {
          messageHandlers.delete(type);
        } else {
          messageHandlers.set(type, nextHandlers);
        }
      }
    }
  }
};


export default App;
