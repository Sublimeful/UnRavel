import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import { getSocketFromAuthHeader } from "../utils/misc.ts";
import type { Room } from "../types.ts";
import type { GameSettings } from "../../types.ts";
import {
  askYesOrNoQuestion,
  getSecretPhraseFromCategory,
} from "../utils/ai.ts";

const router = Router();

router.post("/:roomCode/start-game", async (req, res) => {
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

  // Check if player is the host
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.host !== socket.id) {
    return res.status(400).send("you are not the room host");
  }

  // Get the secret phrase and set the game state secretPhrase
  const secretPhrase = await getSecretPhraseFromCategory(category);
  roomState.game.secretPhrase = secretPhrase;
  console.log(roomCode, "category", category, "secret phrase", secretPhrase);

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

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
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

router.get("/:roomCode/game/ask", async (req, res) => {
  const { question } = req.body;

  // Bad request if question is not in the JSON
  if (!question) {
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

  // Check that the game is in progress
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.game.state !== "in progress") {
    return res.status(400).send("game is not in progress");
  }

  // Ask the ai
  const answer = await askYesOrNoQuestion(
    roomState.game.secretPhrase,
    question,
  );

  return res.status(200).send(JSON.stringify({ answer }));
});

export default router;
