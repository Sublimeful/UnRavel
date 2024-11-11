import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import { getSanitizedPlayerData, getSocketFromAuthHeader } from "../utils.ts";
import type { Player, Room } from "../types.ts";
import type { SID } from "../../types.ts";

const router = Router();

router.post("/player-sign-in", (req, res) => {
  const { username } = req.body;

  // Bad request if username is not in the json
  if (!username) return res.status(400).send("invalid data");

  // Validate and get socket
  const socket = getSocketFromAuthHeader(req.headers.authorization);

  // Bad request
  if (!socket) return res.status(400).send("could not authenticate client");

  console.log(socket.id, "player-sign-in", "username", username);

  // Initialize player state
  state[`player:${socket.id}`] = {
    username,
  };

  return res.status(200).send();
});

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

  // Player joins room
  const roomCode = req.params.roomCode;
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
    return res.status(500).send("an error has occurred");
  }

  // Retrieve the list of players
  const players: Set<SID> = (state[`room:${roomCode}`] as Room).players;

  return res.status(200).send(JSON.stringify(
    Array.from(players).map((sid) => {
      const player = state[`player:${sid}`] as Player;
      // Return a sanitized list of player information
      return getSanitizedPlayerData(player);
    }),
  ));
});

router.get("/:roomCode/start-game", (req, res) => {
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
    return res.status(500).send("an error has occurred");
  }

  // Check if player is the host
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.host !== socket.id) {
    return res.status(400).send("you are not the room host");
  }

  // Set the game state to "in progress"
  roomState.game.state = "in progress";

  // Set the game start time
  roomState.game.startTime = Date.now();

  // Tell every player the game has started
  io.to(roomCode).emit("room-game-start");

  // The game will end when the timer runs out
  setTimeout(() => {
    // Set the game state to ended
    roomState.game.state = "ended";
    // Tell every player the game has ended
    io.to(roomCode).emit("room-game-end");
  }, roomState.game.timeLimit);

  return res.status(200).send();
});

router.get("/:roomCode/game/time-left", (req, res) => {
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
    return res.status(500).send("an error has occurred");
  }

  // Check that the game is in progress
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.game.state !== "in progress") {
    return res.status(400).send("game is not in progress");
  }

  // Calculate the time left in the game and return it to the player
  const timeLeft = roomState.game.timeLimit -
    (Date.now() - roomState.game.startTime);

  return res.status(200).send(JSON.stringify({ timeLeft }));
});

export default router;
