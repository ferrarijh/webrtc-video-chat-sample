import { useEffect, useRef, useState, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { UserStatusContext, UserStatus } from './UserStatusProvider'
import { MediaContext } from './MediaProvider';
import { NetworkContext, SocketEvent } from './NetworkProvider'
import './Room.css';

function Room(props) {

  const myVideoRef = useRef();
  const peerVideoRef = useRef();

  const navigate = useNavigate();
  const params = useParams();

  const { stream, toggleMyCamera } = useContext(MediaContext);
  const { socket } = useContext(NetworkContext);
  const { uid, userStatus, peerId } = useContext(UserStatusContext);

  const [roomId, setRoomId] = useState(null);
  const [peerConn, setPeerConn] = useState(null);
  const [senders, setSenders] = useState([]);

  useEffect(() => {
    setRoomId(params.roomId);

    let newPeerConn = createPeerConn();
    setPeerConn(newPeerConn);
  }, []);

  useEffect(() => {
    if(peerConn === null)
      return;

    socket.on(SocketEvent.OFFER, handleSocketOffer);
    socket.on(SocketEvent.ANSWER, handleSocketAnswer);
    socket.on(SocketEvent.ICE_CANDIDATES, handleSocketICECandidates);
  }, [peerConn])

  // useEffect(() => {
  //   myVideoRef.current.srcObject = stream;

  //   if(stream === null && peerConn !== null){
  //     peerConn.close();
  //     setPeerConn(null);
  //   }

  //   if(stream !== null && peerConn === null){
  //     let newPeerConn = createPeerConn();
  //     setPeerConn(newPeerConn);
  //   }

  //   if(stream !== null && peerConn !== null){
  //     stream.getTracks().forEach(track => peerConn.addTrack(track, stream));  //??
  //   }

  // }, [stream, peerConn]);

  useEffect(() => {
    myVideoRef.current.srcObject = stream;
    if(peerConn === null)
      return;

    //When camera is toggled 'on'
    if (stream !== null){
      stream.getTracks().forEach(track => {
        let sender = peerConn.addTrack(track, stream);
        setSenders(prev => [...prev, sender]);
      });
    }
    //When camera is toggled 'off'
    else{
      senders.forEach(s => peerConn.removeTrack(s));
      setSenders([]);
    }
  }, [stream])

  useEffect(() => {
    switch(userStatus){
      case UserStatus.AVAILABLE:
        alert("Something went wrong...");
        navigate(-1);
        break;
      // case UserStatus.OFFERING:
      //   initiateICEOffer();
      //   break;
    }
  }, [userStatus]);

  // const initiateICEOffer = () => {
  //   let newPeerConn = createPeerConn();
  //   setPeerConn(newPeerConn);
  // }

  //When you're the answerer
  const handleSocketOffer = (payload) => {
    console.log("OFFER: "+JSON.stringify(payload));

    let desc = new RTCSessionDescription(payload.sdp);
    peerConn.setRemoteDescription(desc)
      .then(() => peerConn.createAnswer())
      .then(answer => peerConn.setLocalDescription(answer))
      .then(() => {
        let newPayload = {
          target: payload.caller,
          caller: uid,
          sdp: peerConn.localDescription
        };
        socket.emit(SocketEvent.ANSWER, newPayload);
      });
  };

  const handleSocketAnswer = (payload) => {
    console.log("ANSWER: "+JSON.stringify(payload));
    let desc = new RTCSessionDescription(payload.sdp);
    peerConn.setRemoteDescription(desc).catch(err => console.log(err));
  };

  const handleSocketICECandidates = (payload) => {
    console.log("ICE_CANDIDATES: "+JSON.stringify(payload));
    let candidates = new RTCIceCandidate(payload);
    if(peerConn !== null)
      peerConn.addIceCandidate(candidates).catch(err => console.log(err));
  };

  const createPeerConn = () => {
    const newPeerConn = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        },
        {
          urls: ["turn:13.250.13.83:3478?transport=udp"],
          username: "YzYNCouZM1mhqhmseWk6",
          credential: "YzYNCouZM1mhqhmseWk6"
        }
      ]
    });

    newPeerConn.onicecandidate = onICECandidate;
    newPeerConn.ontrack = onTrack;
    newPeerConn.onnegotiationneeded = () => onNegotiationNeeded(newPeerConn);

    return newPeerConn;
  };

  const onTrack = (ev) => {
    console.log("ontrack..");
    peerVideoRef.current.srcObject = ev.streams[0]; //array??
  };

  const onICECandidate = (ev) => {
    console.log("onicecandidate..");
    if (!ev.candidate)
      return;

    let payload = {
      target: peerId,
      candidate: ev.candidate
    };
    console.log("emitting "+SocketEvent.ICE_CANDIDATES);
    socket.emit(SocketEvent.ICE_CANDIDATES, payload);
  };

  const onNegotiationNeeded = (newPeerConn) => {
    console.log("onnegotiationneeded..");

    newPeerConn.createOffer()
      .then(offer => newPeerConn.setLocalDescription(offer))
      .then(() => {
        let payload = {
          target: peerId,
          caller: uid,
          sdp: newPeerConn.localDescription
        };
        console.log("emitting "+SocketEvent.OFFER);
        socket.emit(SocketEvent.OFFER, payload);
      }).catch(err => console.log(err))
  };

  return (
    <div className="Room">
      <div className="Guide">
        {roomId === null ? <div>not connected...</div> : <div>connected to: [{roomId}]</div>}
      </div>
      <div className="Container">
        <div className="MyVideoContainer">
          <div>This is your video.</div>
          <video className="MyVideo" playsInline autoPlay ref={myVideoRef}></video>
          <div><button className="ToggleMyVideo" onClick={toggleMyCamera}>
            {stream === null ? "Activate Camera" : "Hang Up"}
          </button></div>
        </div>
        <div className="PeerVideoContainer">
          <div>This is remote video.</div>
          <video className="PeerVideo" playsInline autoPlay ref={peerVideoRef} ></video>
        </div>
      </div>
    </div>
  );
}

export default Room;