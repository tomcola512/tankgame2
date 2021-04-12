import React, { createRef, useCallback, useContext, useEffect, useRef, useState } from 'react';

import SocketContext, { TG2Event } from './SocketContext';

export const Chat = () => {
    const socketContext = useContext(SocketContext);

    const [chatLog, setChatLog] = useState([] as any[]);
    // const [chatLog, setChatLog] = useState([] as MessageEvent<any>[]);

    const handleMessage = useCallback((message: TG2Event): void => {
        setChatLog(prior => [...prior, {...message, key: +(new Date())}])
    }, [chatLog, setChatLog]);

    useEffect(() => {
        if (socketContext.addMessageHandler) socketContext.addMessageHandler(handleMessage, 'chat');
        return () => {
            socketContext.removeMessageHandler(handleMessage, 'chat');
        }
    });

    const [message, setMessage] = useState("");
    const submitMessage = useCallback(() => {
        if (message === "") {
            return;
        }
        try {
            socketContext.sendMessage('chat', message);
            setMessage("");
        } catch (e) {
            debugger;
        }
    }, [socketContext, message, setMessage]);

    const formSubmit = useCallback((e) => {
        submitMessage();
        e.preventDefault();
        return false;
    }, [socketContext, message, setMessage]);

    const scrollRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const lastChild = scrollRef?.current?.lastChild;
        if(lastChild instanceof HTMLElement) {
            lastChild.scrollIntoView();
        }
    }, [chatLog])
    return <>
    {/* <div style={{ gridArea: 'CHATLOG', height: '100%', width: '100%', position: 'relative' }}> */}
        <div
        ref={scrollRef}
        style={{
            gridArea: 'CHATLOG',
            overflowY: 'auto',
            borderLeft: '1px solid red',
            wordBreak: 'break-all',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap'
        }}>
            {chatLog.map(({ name, payload, key }, i) =>
                <div style={{flex: '0 0 auto', ...(i === 0 ? {marginTop: 'auto'} : {})}} key={key}>{name}: {payload}</div>)}
        {/* </div> */}
    </div>
        <form style={{ gridArea: 'INPUT', border: '1px solid red' }} onSubmit={formSubmit}>
            <input
                className='chatInput'
                onChange={(event) => setMessage(event.target.value)}
                value={message}
            ></input>
            <button type="submit">SUBMIT</button>
        </form>
    </>
};

export default Chat;
