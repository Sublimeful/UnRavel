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

io.listen(5174);
