import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import { getSanitizedPlayer, getSocketFromAuthHeader } from "../utils/misc.ts";
import { generateSecretTermFromCategory } from "../utils/ai.ts";
import type { Player, Room } from "../types.ts";
import type { GameSettings } from "../../types.ts";
import type { SID } from "../../types.ts";

const router = Router();

router.get("/api/room-request", (req, res) => {
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

router.get("/api/:roomCode/join", (req, res) => {
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

router.get("/api/:roomCode/leave", (req, res) => {
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

router.get("/api/:roomCode/players", (req, res) => {
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

router.get("/api/:roomCode/host", (req, res) => {
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

router.post("/api/:roomCode/start-game", async (req, res) => {
  const { category } = req.body as GameSettings;

  // Bad request if settings are not sent properly
  if (!category) {
    return res.status(400).send("invalid data");
  }

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

  // Check that the game is in a state where it can be started
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.game.state === "in progress") {
    return res.status(400).send(
      "you cannot start a new game while the current one is still in progress",
    );
  }

  // Check if player is the host
  if (roomState.host !== socket.id) {
    return res.status(400).send("you are not the room host");
  }

  // Set the game winner to null (nobody has won this new game yet)
  roomState.game.winner = null;

  // Set the game state category
  roomState.game.category = category;

  // Initialize player stats
  roomState.players.forEach((sid) => {
    roomState.game.playerStats[sid] = { interactions: [], guesses: [] };
  });

  // Generate the secret term
  const secretTerm = await generateSecretTermFromCategory(category);

  // Something went wrong while generating the secret term
  if (!secretTerm) {
    return res.status(500).send("something went wrong");
  }

  // Set the game state secretTerm
  roomState.game.secretTerm = secretTerm;
  console.log(roomCode, "category", category, "secret term", secretTerm);

  // Set the game state to "in progress"
  roomState.game.state = "in progress";

  // Set the game start time
  roomState.game.startTime = Date.now();

  // Tell every player the game has started
  io.to(roomCode).emit("room-game-start");

  // The game will end when the timer runs out
  roomState.game.endTimeout = setTimeout(() => {
    // Set the game state to idle
    roomState.game.state = "idle";
    // Tell every player the game has ended
    io.to(roomCode).emit("room-game-end");
  }, roomState.game.timeLimit);

  return res.status(200).send();
});

export default router;
