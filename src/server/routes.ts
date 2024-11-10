import { Router } from "express";

const router = Router();



router.post("/request-room", (req, res) => {
  

  
});

function roomCodeGenerator() {
  return Math.random().toString(36).slice(2).toUpperCase();
}



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






export default router;
