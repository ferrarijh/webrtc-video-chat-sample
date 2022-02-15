import React, { useContext } from 'react';
import { UserStatus, UserStatusContext } from '../contexts/UserStatusProvider';
import {SocketContext} from '../contexts/SocketProvider'
import './Modal.css';

const ReqReceivedModal = (props) => {

    const { uid, setUserStatus, peerId } = useContext(UserStatusContext);
    const {socket} = useContext(SocketContext);

    const handleAccept = () => {
        console.log("JOIN_OK from "+uid+" to "+peerId);
        socket.emit("JOIN_OK", {answerer: uid, offerer: peerId});
        setUserStatus(UserStatus.ANSWERING);
        props.setJoining(true);
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