import React, { useContext } from 'react';
import { UserStatusContext } from '../contexts/UserStatusProvider';

const ReqSentModal = () => {

    const {peerId} = useContext(UserStatusContext);

    return (
        <div className="ModalContainer">
            <div className="ReqSentModal">
                <div>Waiting for acceptance from {peerId}...</div>
            </div>
        </div>
    );
};

export default ReqSentModal;
