const http = require('http');
const express = require('express');
const {Server} = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const room = {};
const userMap = {};
const uidToSid = {};
const sidToUid = {};
const getAvailableUsers = () => {
    return Object.entries(userMap)
        .filter(pair => pair[1] === UserStatus.AVAILABLE)
        .map(pair => pair[0]);
};

app.get("/users", (req, res) => {
    res.send({"user_list": getAvailableUsers()});
});

/**
 * c1                  Sig.Serv                c2
 * JOIN_REQ(off, ans)===>
 * setUserStatus()
 *                          <===JOIN_OK(ans, off)
 *                           /or REJECT(ans, off)
 * ================= start STUN =================
 */

io.on("connection", socket => {

    socket.on("disconnect", () => {
        let uid = sidToUid[socket.id];
        if(room[uid] && room[uid].length >= 2)
            room[uid].filter(id => id != uid)
                .forEach(id => {
                    userMap[id] = UserStatus.AVAILABLE;
                    io.to(uidToSid[id]).emit("DISCONNECT");
                });
        delete room[uid];
        delete userMap[uid];
        delete sidToUid[socket.id];
        delete uidToSid[uid];
    });

    socket.on("INIT", payload => {
        let uid = payload.uid;
        userMap[uid] = UserStatus.AVAILABLE;
        uidToSid[uid] = socket.id;
        room[uid] = [uid];
        sidToUid[socket.id] = uid;
    });

    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    /* For room */

    //Issued socket is the host.
    //Issuing socket joins the host's room.
    socket.on("JOIN_REQ", ({offerer, answerer}) => {
        if(userMap[answerer]){
            io.to(uidToSid[answerer]).emit("JOIN_REQ", offerer);
            userMap[offerer] = UserStatus.NEGOTIATING;
            userMap[answerer] = UserStatus.NEGOTIATING;
        }
        else{
            console.log("REJECT");
            io.to(uidToSid[offerer]).emit("REJECT", "User does not exist.");
        }
    });

    socket.on("JOIN_OK", ({answerer, offerer}) => {
        console.log("JOIN_OK from "+answerer+" to "+offerer);
        room[answerer] = [...room[answerer], offerer];
        io.to(uidToSid[offerer]).emit("JOIN_OK", answerer);
    });

    socket.on("REJECT", ({answerer, offerer}) => {
        io.to(uidToSid[offerer]).emit("REJECT", answerer+" rejected your call...");
        userMap[answerer] = UserStatus.AVAILABLE;
        userMap[offerer] = UserStatus.AVAILABLE;
    });

    //Forward
    socket.on(SocketEvent.OFFER, payload => {
        console.log("OFFER: "+JSON.stringify(payload));
        io.to(uidToSid[payload.target]).emit(SocketEvent.OFFER, payload);
    });

    //Forward
    socket.on(SocketEvent.ANSWER, payload => {
        console.log("ANSWER: "+JSON.stringify(payload));
        io.to(uidToSid[payload.target]).emit(SocketEvent.ANSWER, payload);
    });

    // msg format: {target, caller, sdp}
    socket.on(SocketEvent.ICE_CANDIDATES, payload => {
        console.log("ICE_CANDIDATES: "+JSON.stringify(payload));
        io.to(uidToSid[payload.target]).emit(SocketEvent.ICE_CANDIDATES, payload.candidate);
    });
});

const UserStatus = Object.freeze({
    AVAILABLE: "AVAILABLE",
    NEGOTIATING: "NEGOTIATING",
    CONNECTED: "CONNECTED"
});

const SocketEvent = Object.freeze({
    OFFER: "OFFER",
    ANSWER: "ANSWER",
    ICE_CANDIDATES: "ICE_CANDIDATES"
})

httpServer.listen(8080);