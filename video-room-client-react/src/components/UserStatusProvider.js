import React, {useState, useEffect} from 'react';
import {v1 as uuid} from 'uuid';
import { useLocation } from 'react-router-dom';

const UserStatusContext = React.createContext();

const UserStatusProvider = (props) => {

    const location = useLocation();
    const [userStatus, setUserStatus] = useState(UserStatus.AVAILABLE);
    const [uid, setUid] = useState(null);
    const [peerId, setPeerId] = useState(null);

    useEffect(() => {
        let newId = uuid();
        setUid(newId);
    }, []);

    useEffect(() => {
        let path = location.pathname.split('/')[1];
        if(path !== "room" && userStatus !== UserStatus.AVAILABLE)
            setUserStatus(UserStatus.AVAILABLE);
    }, [location.pathname]);

    return (
        <UserStatusContext.Provider value={{uid, userStatus, setUserStatus, peerId, setPeerId}}>
            {props.children}
        </UserStatusContext.Provider>
    )
}

const UserStatus = Object.freeze({
    AVAILABLE: "AVAILABLE",
    REQ_SENT: "REQ_SENT",
    OFFERING: "OFFERING",
    REJECT: "REJECT",
    REQ_RECEIVED: "REQ_RECEIVED",
    ANSWERING: "ANSWERING",
    CONNECTED: "CONNECTED"
});

export default UserStatusProvider;
export {UserStatusContext, UserStatus};