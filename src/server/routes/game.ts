import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import {
  getSanitizedPlayer,
  getSanitizedPlayerStats,
  getSocketFromAuthHeader,
} from "../utils/misc.ts";
import type { Player, Room } from "../types.ts";
import type {
  GameSettings,
  PlayerID,
  PlayerStatsSanitized,
} from "../../types.ts";
import {
  askClosedEndedQuestion,
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
    // Set the game state to idle
    roomState.game.state = "idle";
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

  const roomState = state[`room:${roomCode}`] as Room;

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
  const answer = await askClosedEndedQuestion(
    roomState.game.secretPhrase,
    roomState.game.category,
    question,
  );

  // AI doesn't want to answer the question because it sucks
  if (!answer) {
    return res.status(400).send("no answer from ai");
  }

  // Log the interaction
  if (socket.id in roomState.game.playerStats) {
    roomState.game.playerStats[socket.id].interactions.push({
      question,
      answer,
    });
  }

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

  // Log the guess
  if (socket.id in roomState.game.playerStats) {
    roomState.game.playerStats[socket.id].guesses.push(guess);
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
    return arr[t.length][s.length];
  }

  // Get the proximity
  const proximity = 1 - (levenshteinDistance(
    guess.toLowerCase(),
    roomState.game.secretPhrase.toLowerCase(),
  ) / Math.max(guess.length, roomState.game.secretPhrase.length));

  // Player won the game
  if (proximity === 1) {
    // Set the game state to idle
    roomState.game.state = "idle";
    // Set the winner
    roomState.game.winner = socket.id;
    // Tell every player the game has ended
    io.to(roomCode).emit("room-game-end");
  }

  return res.status(200).send(JSON.stringify({ proximity }));
});

router.get("/:roomCode/game/winner", (req, res) => {
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

  // Check that the game has ended
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.game.state !== "idle") {
    return res.status(400).send("game has not ended");
  }

  // If winner is null, then it was a tie
  if (!roomState.game.winner) {
    return res.status(200).send(
      JSON.stringify({ winner: null }),
    );
  }

  // Get the winner
  if (!(`player:${roomState.game.winner}` in state)) {
    return res.status(400).send("could not find winner");
  }
  const winner = state[`player:${roomState.game.winner}`] as Player;

  return res.status(200).send(
    JSON.stringify({ winner: getSanitizedPlayer(winner) }),
  );
});

router.get("/:roomCode/game/secret-phrase", (req, res) => {
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

  // Check that the game has ended
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.game.state !== "idle") {
    return res.status(400).send("game has not ended");
  }

  return res.status(200).send(
    JSON.stringify({ secretPhrase: roomState.game.secretPhrase }),
  );
});

router.get("/:roomCode/game/player-stats", (req, res) => {
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

  // Check that the game has ended
  const roomState = state[`room:${roomCode}`] as Room;
  if (roomState.game.state !== "idle") {
    return res.status(400).send("game has not ended");
  }

  // Get sanitized player stats
  const playerStatsSanitized: Record<PlayerID, PlayerStatsSanitized> = {};
  Object.entries(roomState.game.playerStats).forEach(([sid, playerStats]) => {
    // Check if player state exists
    if (!(`player:${sid}` in state)) return;
    const player = state[`player:${sid}`] as Player;
    playerStatsSanitized[player.id] = getSanitizedPlayerStats(playerStats);
  });

  return res.status(200).send(
    JSON.stringify({ playerStats: playerStatsSanitized }),
  );
});

export default router;
