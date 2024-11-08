import { Server } from "socket.io";

export const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.listen(5174);

io.on("connection", (socket) => {
  console.log(socket.id, "connection");
  socket.on("disconnect", (_) => {
    console.log(socket.id, "disconnect");
  });

  socket.on("requestRoom", (_) => {
    console.log(socket.id, "requestRoom");
  });
});
