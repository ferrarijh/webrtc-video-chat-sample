import React, { useEffect, useState, useContext} from 'react';
import {useLocation} from 'react-router-dom';
import {io} from 'socket.io-client';
import { UserStatusContext, UserStatus } from './UserStatusProvider';

const SocketContext = React.createContext();

const SocketProvider = (props) => {

    const location = useLocation();
    const [socket, setSocket] = useState(null);
    const [socketStatus, setSocketStatus] = useState(SocketStatus.DISCONNECTED);
    const {uid, setUserStatus, setPeerId} = useContext(UserStatusContext);

    useEffect(() => {
        if(uid === null)
            return;

        let newSocket = io("ws://"+Address.HOST+":"+Address.PORT);
        setSocket(newSocket);

        newSocket.emit("INIT", {uid: uid});

        newSocket.on("connect", handleConnect);
        newSocket.on("disconnect", handleDisconnect);
        newSocket.on("JOIN_REQ", handleJoinReq);
        newSocket.on("REJECT", handleReject);
        newSocket.on("JOIN_OK", handleJoinOk)
    }, [uid]);

    useEffect(() => {
        let pathArr = location.pathname.split("/");
        if(pathArr[pathArr.length-1] === "waiting-room" && socket !== null)
            socket.emit("INIT", {uid: uid});
    }, [location.pathname])

    const handleConnect = () => {
        setSocketStatus(SocketStatus.CONNECTED);
    }

    const handleDisconnect = () => {
        setSocketStatus(SocketStatus.DISCONNECTED);
        alert("Disconnected from signaling server...");
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
        <SocketContext.Provider value={{socket, setSocket, socketStatus, setSocketStatus}}>
            {props.children}
        </SocketContext.Provider>
    );
};

const SocketStatus = Object.freeze({
    CONNECTED: "CONNECTED",
    DISCONNECTED: "DISCONNECTED"
})

const SocketEvent = Object.freeze({
    OFFER: "OFFER",
    ANSWER: "ANSWER",
    ICE_CANDIDATES: "ICE_CANDIDATES",
    DISCONNECT: "DISCONNECT"
})

const Address = Object.freeze({
    HOST: "localhost",
    // HOST: "13.125.102.64",
    PORT: "8080"
})

export default SocketProvider;
export {SocketContext, SocketStatus, SocketEvent, Address};
