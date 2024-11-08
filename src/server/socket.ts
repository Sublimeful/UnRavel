import { Server } from "socket.io";

export const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.listen(5174);

function roomCodeGenerator() {
  return Math.random().toString(36).slice(2).toUpperCase();
}

io.on("connection", (socket) => {
  console.log(socket.id, "connection");
  socket.on("disconnect", (_) => {
    console.log(socket.id, "disconnect");
  });

  socket.on("room-request", (_) => {
    console.log(socket.id, "room-request");
    console.log(socket.id, "rooms", socket.rooms);

    // Disallow if client is already in a room
    if (socket.rooms.size > 1) return;

    // Get a random room code
    let roomCode = roomCodeGenerator();
    while (roomCode in io.sockets.adapter.rooms) roomCode = roomCodeGenerator();

    socket.join(roomCode);
  });
});

io.sockets.adapter.on("join-room", (roomCode, sid) => {
  const socket = io.sockets.sockets.get(sid)!;
  socket.emit("room-joined", roomCode);
});
