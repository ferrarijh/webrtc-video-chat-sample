import React, { useContext } from 'react';
import { UserStatus, UserStatusContext } from './UserStatusProvider';
import {NetworkContext} from './NetworkProvider'
import './Modal.css';

const ReqReceivedModal = () => {

    const { uid, setUserStatus, peerId } = useContext(UserStatusContext);
    const {socket} = useContext(NetworkContext);

    const handleAccept = () => {
        console.log("JOIN_OK from "+uid+" to "+peerId);
        socket.emit("JOIN_OK", {answerer: uid, offerer: peerId});
        setUserStatus(UserStatus.ANSWERING);
    }

    const handleReject = () => {
        socket.emit("REJECT", {answerer: uid, offerer: peerId});
        setUserStatus(UserStatus.AVAILABLE);
    }

    return (
        <div className="ModalContainer">
            <div className="ReqReceivedModal">
                <div>{peerId} wants to chat with you. Accept?</div>
                <div className="Buttons">
                    <button onClick={handleAccept}>Accept</button>
                    <button onClick={handleReject}>Reject</button>
                </div>
            </div>
        </div>
    );
};

export default ReqReceivedModal;