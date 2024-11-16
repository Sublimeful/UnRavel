import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

export const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

instrument(io, {
  auth: false,
  mode: "development",
});

io.on("connection", (socket) => {
  console.log(socket.id, "connection");
  socket.on("disconnect", () => {
    console.log(socket.id, "disconnect");
  });
});

io.listen(5174);
