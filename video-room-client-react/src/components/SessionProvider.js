import React, { useEffect, useState } from 'react';
import {io} from 'socket.io-client';

const SessionContext = React.createContext();

const NetworkContext = (props) => {

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if(props.uid === null)
            return;

        let newSocket = io("ws://localhost:8080/");
        setSocket(newSocket);
        newSocket.emit("INIT", {uid: props.uid});
    }, [props.uid]);

    return (
        <SessionContext.Provider value={{io: socket, setSession: setSocket}}>
            {props.children}
        </SessionContext.Provider>
    );
};

export default NetworkContext;
export {SessionContext};
