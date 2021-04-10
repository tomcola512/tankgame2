import React, { useCallback, useState } from 'react';

interface SocketWrapper {
  sendMessage(message: String): void
  addMessageHandler(messageHandler: (message: MessageEvent<any>) => void): void
}

function App() {
  const [name, setName] = useState("");
  const [uuid, setUuid] = useState("");

  const [chatLog, setChatLog] = useState([] as any[]);

  const [webSocket, setWebSocket] = useState({} as SocketWrapper);

  const appendMessageToChatLog = useCallback(message => {
    setChatLog(prior => [...prior, JSON.parse(message.data).data])
  }, [chatLog, setChatLog]);
  const submit = useCallback(() => {
    const socket = buildClient(name, uuid);
    socket.addMessageHandler(appendMessageToChatLog)
    setWebSocket(socket);
  }, [name, uuid, chatLog]);

  const [message, setMessage] = useState("");
  const submitMessage = useCallback(() => {
    if(message === "") {
      return;
    }
    try {
      webSocket.sendMessage(message);
      setMessage("");
    } catch (e) {
      debugger;
    }
  }, [webSocket, message, setMessage])

  const formSubmit = useCallback((e) => {
    submitMessage();
    e.preventDefault();
    return false;
  }, [webSocket, message, setMessage])
  return (
    <div className="App">
      {Object.keys(webSocket).length == 0
        ? <>
          <div>ENTER AUTH UUID: <input onChange={(event) => setUuid(event.target.value)}></input></div>
          <div>ENTER NAME: <input onChange={(event) => setName(event.target.value)}></input></div>
          <div><button onClick={submit}>LOGIN</button></div>
        </>
        : <div style={{
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
          gridTemplateColumns: '1fr min-content'
        }}>
          <div style={{ gridArea: 'TITLE', backgroundColor: 'white', color: 'red' }}>
            I AM DA TITLE
          </div>
          <div style={{ gridArea: 'GAME', backgroundColor: 'black', color: 'green' }}>
            I AM DA GAME
          </div>
          <div style={{ gridArea: 'CHATLOG', overflowY: 'auto', borderLeft: '1px solid red' }}>
            {chatLog.map(({ name, message }) => <div>{name}: {message}</div>)}
          </div>
          <form style={{ gridArea: 'INPUT', border: '1px solid red' }} onSubmit={formSubmit}>
            <input
              className='chatInput'
              onChange={(event) => setMessage(event.target.value)}
              value={message}
            ></input>
            <button type="submit">SUBMIT</button>
          </form>
        </div>
      }
    </div>
  );
}

const buildClient = (name = 'bob', uuid: String, { target = 'ws://localhost:8878' } = {}) => {
  const socket = new WebSocket(target);
  const authenticate = (msg: any): any => ({ ...msg, token: uuid });
  socket.onopen = event => {
    socket.send(JSON.stringify(authenticate({ name, message: 'CONNECTED' })));
  }
  const messageHandlers: { (messageHandler: MessageEvent<any>): void; }[] = [];
  socket.onmessage = (event) => {
    if (event.data === "BEEP") {
      console.log("heartbeat received");
    } else {
      messageHandlers.forEach(messageHandler => messageHandler(event));
      const { data: { name, message } } = JSON.parse(event.data.toString());
      console.log(name, "RECEIVED FROM " + name + ": ", message);
    }
  }
  return {
    sendMessage: (message: String) => socket.send(JSON.stringify(authenticate({ name, message }))),
    addMessageHandler: (messageHandler: (message: MessageEvent<any>) => void) => { messageHandlers.push(messageHandler) }
  }
};


export default App;
