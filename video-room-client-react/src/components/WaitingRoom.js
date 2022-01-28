import {useState, useContext, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import {connect, io} from 'socket.io-client'
import { MediaContext } from './MediaProvider';
import './WaitingRoom.css'

const url = "http://localhost:8080/users";

const WaitingRoom = (props) => {

    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const {stream, toggleMyCamera} = useContext(MediaContext);
    const videoRef = useRef();

    useEffect(() => {
        if(props.uid !== null)
            updateUserList();
    }, [props.uid]);

    useEffect(() => {
        videoRef.current.srcObject = stream;
    }, [stream]);

    const handleClickUser = (ev) => {
        navigate("/room/"+ev.target.value);
    }

    const updateUserList = () => {
        const url = "http://localhost:8080/users";
        fetch(url, {
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
    }

    const strCmp = (s1, s2) => {
        if(s1.length !== s2.length)
            return false;
        for(let i=0; i<s1.length; i++)
            if(s1[i] !== s2[i])
                return false;
        return true;
    }

    return(
        <div className="WaitingRoom">
            <div className="UserListContainer">
                <div>- Available Users -</div>
                <button onClick={updateUserList}>Update List</button>
                <div className="UserList">
                { users.length === 0
                    ? <div className="NoUsersGuide"><i>No available users now..</i></div>
                    : users.filter(uid => uid !== props.uid)
                        .map((uid, i) => {
                            let cn = i%2 == 0 ? "UserEven" : "UserOdd";
                            return <div className={cn} onClick={handleClickUser} key={i}>{uid}</div>;
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
