import { Server } from 'socket.io'

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {

    const io = new Server(res.socket.server)

    io.on('connection', socket => {
      socket.on("join", function (roomName) {
        const rooms = io.sockets.adapter.rooms;
        const room = rooms.get(roomName);
    
        if (!room) {
          socket.join(roomName);
          console.log("created");
          socket.emit("created");
        } else if (room.size === 1) {
          socket.join(roomName);
          console.log("joined");
          socket.emit("joined");
        } else {
          socket.emit("full");
        }
        console.log("rooms", rooms);
      });
    
      //Triggered when the person who joined the room is ready to communicate.
      socket.on("ready", function (roomName) {
        socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
      });
    
      //Triggered when server gets an icecandidate from a peer in the room.
      socket.on("candidate", function (candidate, roomName) {
        // console.log(candidate);
        socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
      });
    
      //Triggered when server gets an offer from a peer in the room.
      socket.on("offer", function (offer, roomName) {
        // console.log(offer);
        socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
      });
    
      //Triggered when server gets an answer from a peer in the room.
      socket.on("answer", function (answer, roomName) {
        socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
      });
    
      socket.on("leave", function (roomName) {
        socket.leave(roomName);
        socket.broadcast.to(roomName).emit("leave");
      });
    })

    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler