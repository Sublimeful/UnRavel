import { Router } from "express";

import { io } from "../socket.ts";

const router = Router();

router.post("/room-request", (req, res) => {
  function roomCodeGenerator() {
    return Math.random().toString(36).slice(2).toUpperCase();
  }

  const { sid, username } = req.body;

  // Bad request if either sid or username is not in the json
  if (!sid || !username) return res.status(400).send("invalid data");

  // Get the associated socket
  const socket = io.sockets.sockets.get(sid);

  // Bad request if socket does not exist
  if (!socket) return res.status(400).send("sid is not valid");

  // Disallow if client is already in a room
  if (socket.rooms.size > 1) return;

  // Get a random room code
  let roomCode = roomCodeGenerator();
  while (roomCode in io.sockets.adapter.rooms) roomCode = roomCodeGenerator();

  socket.join(roomCode);

  return res.status(200).send(JSON.stringify({
    roomCode,
  }));
});

export default router;
