import { useEffect, useRef, useState, useContext } from 'react'
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client'
import { MediaContext } from './MediaProvider';
import './Room.css';

function Room(props) {

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();

  const params = useParams();
  const {stream, toggleMyCamera} = useContext(MediaContext);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [peerConn, setPeerConn] = useState(null);

  useEffect(() => {
    myVideoRef.current.srcObject = stream;
  }, [stream])
  

  const connect = (stream) => {
    myStream = stream;
    let newSocket = io.connect("?");
    setSocket(newSocket);

    // newSocket.emit("JOIN", roomId);
    // newSocket.on();
    // newSocket.on("USER_IN",);
    // newSocket.on("OFFER", handleOffer);
    // newSocket.on("ANSWER", handleAnswer);
    // newSocket.on()
  }

  const stopMediaDevices = () => {
    myStream.getTracks().forEach(track => track.stop());
    setMyStream(null);
  };

  const callUser = (userId) => {
    let newPeer = createPeer(userId);
    setPeerConn(newPeer);

  }

  const createPeer = (userId) => {
    // const peer = new RTCPeerConnection({
    //   iceServers: [
    //     {
    //       urls: "stun4.l.google.com:19302"
    //     }
    //   ]
    // });

    // peer.onicecandidate = handleICECandidateEvent;
    // peer.ontrack = handleTrackEvent;
    // peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    // return peer;
  }

  const handleNegotiationNeededEvent = (userId) => {
    peerConn.createOffer()
      .then(offer => {
        peerConn.setLocalDescription(offer);
      }).then(() => {

      })
  }

  const handleSubmit = (ev) => {
    ev.preventDefault();
  };

  return (
    <div className="Room">
      <div className="Guide">
        {roomId === null ? <div>not connected...</div> : <div>connected to: [{roomId}]</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <label>Room Id: </label>
        <input type="text" />
      </form>
      <div className="Container">
        <div className="MyVideoContainer">
          <div>This is your video.</div>
          <video className="MyVideo" playsInline autoPlay ref={myVideoRef}></video>
          <div><button className="ToggleMyVideo" onClick={toggleMyCamera}>Toggle My Video</button></div>
        </div>
        <div className="RemoteVideoContainer">
          <div>This is remote video.</div>
          <video className="RemoteVideo" playsInline autoPlay ref={remoteVideoRef} ></video>
        </div>
      </div>
    </div>
  );
}

export default Room;