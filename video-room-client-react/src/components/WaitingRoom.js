import {useState, useContext, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaContext } from './MediaProvider';
import {UserStatus, UserStatusContext} from './UserStatusProvider'
import './WaitingRoom.css'
import { Address, SocketContext, SocketStatus } from './SocketProvider';
import ReqReceivedModal from './ReqReceivedModal';
import ReqSentModal from './ReqSentModal.js'

const usersUrl = "http://"+Address.HOST+":"+Address.PORT+"/users";

const WaitingRoom = (props) => {

    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [joining, setJoining] = useState(false);
    const {stream, toggleMyCamera} = useContext(MediaContext);
    const {uid, peerId, setPeerId, userStatus, setUserStatus} = useContext(UserStatusContext);
    const {socket, socketStatus} = useContext(SocketContext);
    const videoRef = useRef();

    useEffect(() => {
        updateUserList();
        console.log("useEffect in WaitingRoom...");
        return () => {
            console.log("cleanup in WaitingRoom...");
            if(stream !== null){
                toggleMyCamera();
                videoRef.current.srcObject = stream;
            }
        }
    }, []);
    
    useEffect(() => {
        videoRef.current.srcObject = stream;
    }, [stream]);

    const handleClickUser = (ev) => {
        setJoining(true);
        let newPeerId = ev.target.innerText;
        setPeerId(newPeerId);
        setUserStatus(UserStatus.REQ_SENT);
        let payload = {offerer: uid, answerer: newPeerId}
        socket.emit("JOIN_REQ", payload);
    };
    useEffect(() => {
        if(peerId === null || uid === null)
            return;

        switch(userStatus){
            case UserStatus.OFFERING:
                if(!joining) return;
                navigate("/room/"+peerId);
                break;
            case UserStatus.REJECT:
                setPeerId(null);
                setJoining(false);
                break;
            case UserStatus.ANSWERING:
                if(!joining) return;
                navigate("/room/"+uid);
                break;
        }
    }, [userStatus, peerId, uid]);

    const updateUserList = () => {
        fetch(usersUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json())
        .then(data => {
            console.log("data: ", data);
            return data;
        }).then(data => setUsers(data.user_list))
        .catch(err => console.log("fetch error: "+err));
    };

    return(
        <div className="WaitingRoom">

            {userStatus === UserStatus.REQ_RECEIVED && <ReqReceivedModal setJoining={setJoining}/>}
            {userStatus === UserStatus.REQ_SENT && <ReqSentModal/>}

            <div className="YourUidGuide">Your uid: {uid}</div>
            <div className={socketStatus === SocketStatus.CONNECTED ? "SocketConnected" : "SocketDisconnected" }>
                {socketStatus === SocketStatus.CONNECTED 
                    ? "Connected to Signaling Server."
                    : "Disconnected from Signaling Server."}
            </div>
            <div className="UserListContainer">
                <div>- Available Users -</div>
                <button onClick={updateUserList}>Update List</button>
                <div className="UserList">
                { users.length <= 1
                    ? <div className="NoUsersGuide"><i>No available users now..</i></div>
                    : users.filter(_uid => _uid !== uid)
                        .map((_uid, i) => {
                            let cn = i%2 === 0 ? "UserEven" : "UserOdd";
                            return <div className={cn} onClick={handleClickUser} key={i}>{_uid}</div>;
                            }
                        )
                }
                </div>
            </div>
            <div className="VideoContainer">
                <video autoPlay playsInline ref={videoRef}></video>
                <button onClick={toggleMyCamera}>Click to toggle video</button>
            </div>
        </div>
    )
};

export default WaitingRoom;
