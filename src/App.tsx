import React, { useCallback, useState } from 'react';
import SocketContext, { SocketWrapper, buildClient } from './SocketContext';
import Chat from './Chat';
import Game from './Game';

function App() {
  const [name, setName] = useState("");
  const [uuid, setUuid] = useState("");

  const [webSocket, setWebSocket] = useState({} as SocketWrapper);

  const clearCallback = useCallback((event) => {
    setWebSocket({} as SocketWrapper);
  }, [webSocket, setWebSocket])
  const submit = useCallback(() => {
    const socket = buildClient(name, uuid, clearCallback);
    setWebSocket(socket);
  }, [name, uuid, webSocket, setWebSocket]);
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

export default App;
