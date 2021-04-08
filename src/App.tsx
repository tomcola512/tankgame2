import React, {useCallback, useState} from 'react';

interface SocketWrapper {
  sendMessage(message: String): void
  addMessageHandler(messageHandler: (message: MessageEvent<any>) => void): void
}

function App() {
  const [name, setName] = useState("");
  const [uuid, setUuid] = useState("");

  const [chatLog, setChatLog] = useState([] as any[]);

  const [webSocket, setWebSocket] = useState({} as SocketWrapper);
  const submit = useCallback(() => {
    const socket = buildClient(name, uuid);
    socket.addMessageHandler(message => {
      debugger;
      setChatLog(prior => [...prior, JSON.parse(message.data).data]);
    })
    setWebSocket(socket);
  }, [name, uuid]);

  const [message, setMessage] = useState("");
  const submitMessage = useCallback(() => {
    try {
    webSocket.sendMessage(message);
    } catch (e) {
      debugger;
    }
  }, [webSocket, message])
  return (
    <div className="App">
      {Object.keys(webSocket).length == 0
        ? <>
            <div>ENTER AUTH UUID: <input onChange={(event) => setUuid(event.target.value)}></input></div>
            <div>ENTER NAME: <input onChange={(event) => setName(event.target.value)}></input></div>
            <div><button onClick={submit}>LOGIN</button></div>
          </>
        : <>
            <div>
              <div>CHAT LOG:</div>
              {chatLog.map(({name, message}) => <div>{name}: {message}</div>)}
            </div>
            <div><input onChange={(event) => setMessage(event.target.value)}></input><button onClick={submitMessage}>SUBMIT</button></div>
          </>
      }

      
    </div>
  );
}

const buildClient = (name = 'bob', uuid: String, {target = 'ws://localhost:8878'} = {}) => {
    const socket = new WebSocket(target);
    const authenticate = (msg: any): any => ({...msg, token: uuid});
    socket.onopen = event => {
        socket.send(JSON.stringify(authenticate({name, message: 'CONNECTED'})));
    }
    const messageHandlers: {(messageHandler: MessageEvent<any>): void;}[] = [];
    socket.onmessage = (event) => {
        if(event.data === "BEEP") {
            console.log("heartbeat received");
        } else {
            messageHandlers.forEach(messageHandler => messageHandler(event));
            const { data: {name, message} } = JSON.parse(event.data.toString());
            console.log(name,  "RECEIVED FROM " + name +": ", message);
        }
    }
    return {
        sendMessage: (message: String) => socket.send(JSON.stringify(authenticate({name, message}))),
        addMessageHandler: (messageHandler: (message: MessageEvent<any>) => void) => {messageHandlers.push(messageHandler)}
    }
};


export default App;
