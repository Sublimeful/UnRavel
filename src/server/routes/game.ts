import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import { getSocketFromAuthHeader } from "../utils/misc.ts";
import type { Room } from "../types.ts";
import type { GameSettings } from "../../types.ts";
import {
  askYesOrNoQuestion,
  generateSecretPhraseFromCategory,
} from "../utils/ai.ts";

const router = Router();

router.post("/:roomCode/start-game", async (req, res) => {
  console.log(req.body);
  const { category } = req.body as GameSettings;
  console.log(category);

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

  // Set the game state category
  roomState.game.category = category;

  // Generate the secret phrase
  const secretPhrase = await generateSecretPhraseFromCategory(category);

  // Something went wrong while generating the secret phrase
  if (!secretPhrase) {
    return res.status(500).send("something went wrong");
  }

  // Set the game state secretPhrase
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

router.get("/:roomCode/game/category", (req, res) => {
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

  return res.status(200).send(
    JSON.stringify({ category: roomState.game.category }),
  );
});

router.post("/:roomCode/game/ask", async (req, res) => {
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

router.post("/:roomCode/game/guess", async (req, res) => {
  const { guess } = req.body as { guess: string };

  // Bad request if guess is not in the JSON
  if (!guess) {
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

  function levenshteinDistance(s: string, t: string) {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
      arr[i] = [i];
      for (let j = 1; j <= s.length; j++) {
        arr[i][j] = i === 0 ? j : Math.min(
          arr[i - 1][j] + 1,
          arr[i][j - 1] + 1,
          arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1),
        );
      }
    }
    console.log(arr);
    return arr[t.length][s.length];
  }

  // Get the proximity
  const proximity = levenshteinDistance(
    guess.toLowerCase(),
    roomState.game.secretPhrase.toLowerCase(),
  ) / Math.max(guess.length, roomState.game.secretPhrase.length);

  return res.status(200).send(JSON.stringify({ proximity }));
});

export default router;
