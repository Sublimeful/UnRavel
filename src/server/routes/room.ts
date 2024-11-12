import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import { getSanitizedPlayer, getSocketFromAuthHeader } from "../utils/misc.ts";
import type { Player, Room } from "../types.ts";
import type { SID } from "../../types.ts";

const router = Router();

router.get("/room-request", (req, res) => {
  function roomCodeGenerator() {
    return Math.random().toString(36).slice(2).toUpperCase();
  }

  // Validate and get socket
  const socket = getSocketFromAuthHeader(req.headers.authorization);

  // Bad request
  if (!socket) return res.status(400).send("could not authenticate client");

  // Disallow if client is already in a room
  if (socket.rooms.size > 1) return;

  // Get a random room code
  let roomCode = roomCodeGenerator();
  while (roomCode in io.sockets.adapter.rooms) roomCode = roomCodeGenerator();

  // Join the room
  socket.join(roomCode);

  return res.status(200).send(JSON.stringify({
    roomCode,
  }));
});

router.get("/:roomCode/join", (req, res) => {
  // Validate and get socket
  const socket = getSocketFromAuthHeader(req.headers.authorization);

  // Bad request
  if (!socket) return res.status(400).send("could not authenticate client");

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  // Check if socket is already in the requested room
  if (socket.rooms.has(roomCode)) {
    return res.status(400).send("you are already in this room");
  }

  // Player joins room
  socket.join(roomCode);

  return res.status(200).send();
});

router.get("/:roomCode/leave", (req, res) => {
  // Validate and get socket
  const socket = getSocketFromAuthHeader(req.headers.authorization);

  // Bad request
  if (!socket) return res.status(400).send("could not authenticate client");

  // Check if socket is in the requested room
  const roomCode = req.params.roomCode;
  if (!socket.rooms.has(roomCode)) {
    return res.status(400).send("you are not in this room");
  }

  // Player leaves room
  socket.leave(roomCode);

  return res.status(200).send();
});

router.get("/:roomCode/players", (req, res) => {
  // Validate and get socket
  const socket = getSocketFromAuthHeader(req.headers.authorization);

  // Bad request
  if (!socket) return res.status(400).send("could not authenticate client");

  // Check if socket is in the requested room
  const roomCode = req.params.roomCode;
  if (!socket.rooms.has(roomCode)) {
    return res.status(400).send("you are not in this room");
  }

  // If the room state is not found, then something went wrong
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("an error has occurred");
  }

  // Retrieve the list of players
  const players: Set<SID> = (state[`room:${roomCode}`] as Room).players;

  return res.status(200).send(JSON.stringify(
    Array.from(players).map((sid) => {
      // Return a sanitized list of player information
      return getSanitizedPlayer(state[`player:${sid}`] as Player);
    }),
  ));
});

router.get("/:roomCode/host", (req, res) => {
  // Validate and get socket
  const socket = getSocketFromAuthHeader(req.headers.authorization);

  // Bad request
  if (!socket) return res.status(400).send("could not authenticate client");

  // Check if socket is in the requested room
  const roomCode = req.params.roomCode;
  if (!socket.rooms.has(roomCode)) {
    return res.status(400).send("you are not in this room");
  }

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  // Get the host player
  const roomState = state[`room:${roomCode}`] as Room;
  const hostPlayer = state[`player:${roomState.host}`] as Player;

  return res.status(200).send(JSON.stringify(
    { host: hostPlayer.id },
  ));
});

export default router;
