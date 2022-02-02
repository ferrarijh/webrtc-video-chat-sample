import React, { useEffect, useState, useContext} from 'react';
import {io} from 'socket.io-client';
import { UserStatusContext, UserStatus } from './UserStatusProvider';

const NetworkContext = React.createContext();

const NetworkProvider = (props) => {

    const [socket, setSocket] = useState(null);
    const {uid, setUserStatus, setPeerId} = useContext(UserStatusContext);

    useEffect(() => {
        if(uid === null)
            return;

        let newSocket = io("ws://localhost:8080/");
        setSocket(newSocket);

        newSocket.emit("INIT", {uid: uid});

        newSocket.on("disconnect", handleDisconnect);
        newSocket.on("JOIN_REQ", handleJoinReq);
        newSocket.on("REJECT", handleReject);
        newSocket.on("JOIN_OK", handleJoinOk)
    }, [uid]);
    
    const handleDisconnect = () => {
        alert("Disconnected with signaling server...")
        // navigate("/waiting-room", {replace: true});
    }

    const handleJoinReq = (offerer) => {
        setUserStatus(UserStatus.REQ_RECEIVED);
        setPeerId(offerer);
    }

    const handleReject = (payload) => {
        setUserStatus(UserStatus.REJECT);
        alert(payload);
    }

    const handleJoinOk = (answerer) => {
        setUserStatus(UserStatus.OFFERING);
    }

    return (
        <NetworkContext.Provider value={{socket, setSocket}}>
            {props.children}
        </NetworkContext.Provider>
    );
};

const SocketEvent = Object.freeze({
    OFFER: "OFFER",
    ANSWER: "ANSWER",
    ICE_CANDIDATES: "ICE_CANDIDATES"
})

export default NetworkProvider;
export {NetworkContext, SocketEvent};
