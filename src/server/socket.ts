import { Server } from "socket.io";

export const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log(socket.id, "connection");
  socket.on("disconnect", (_) => {
    console.log(socket.id, "disconnect");
  });
});

io.sockets.adapter.on("join-room", (roomCode, sid) => {
  const socket = io.sockets.sockets.get(sid)!;
  console.log(socket.id, "join-room", roomCode);
});

io.listen(5174);
