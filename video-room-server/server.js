const http = require('http');
const express = require('express');
const {Server} = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const room = {};   //only two users per room. {'jack': null, ...} or {'jack':'bob'}
const sidToUid = {};

app.get("/users", (req, res) => {
    let availableUsers = Object.entries(room)
        .filter(pair => pair[1] === null)
        .map(pair => pair[0]);
    res.send({"user_list": availableUsers});
})

io.on("connection", socket => {
    socket.on("disconnect", () => {
        let uid = sidToUid[socket.id];
        delete room[uid];
    })

    socket.on("INIT", payload => {
        let uid = payload.uid;
        room[uid] = null;
        sidToUid[socket.id] = uid;
    });

    socket.on("CONNECT", uid => {
        if(room[uid].length !== 0)
            room[uid].push(socket.id)
        else
            room[uid] = [socket.id];
        
        let others = room[uid].filter(id => id !== socket.id);
        socket.emit("USER_LIST", room[uid]);
        socket.to(others).emit("USER_IN", socket.id);
    });

    //forward
    socket.on("OFFER", payload => {
        io.to(payload.target).emit("OFFER", payload);
    });

    //forward
    socket.on("ANSWER", payload => {
        io.to(payload.target).emit("ANSWER", payload);
    });

    // msg format: {target, caller, sdp}
    socket.on("ICE_CANDIDATES", msg => {
        io.to(msg.target).emit("ICE_CANDIDATES", msg.candidates);
    })
});

httpServer.listen(8080)