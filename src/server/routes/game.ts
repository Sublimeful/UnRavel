import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import { getSocketFromAuthHeader } from "../utils/misc.ts";
import type { Room } from "../types.ts";
import { getPhraseFromCategory } from "../utils/ai.ts";

const router = Router();

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

  // Get the secret phrase
  // await getPhraseFromCategory(

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
