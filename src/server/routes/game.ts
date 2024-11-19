import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import {
  getSanitizedPlayer,
  getSanitizedPlayerStats,
} from "../utils/player.ts";
import type { Player, Room } from "../types.ts";
import type { PlayerStatsSanitized } from "../../types.ts";
import { askClosedEndedQuestion } from "../utils/ai.ts";
import { verifyRequestAndGetUID } from "../utils/api.ts";

const router = Router();

router.get("/api/:roomCode/game/state", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  return res.status(200).send(JSON.stringify({ state: roomState.game.state }));
});

router.get("/api/:roomCode/game/time-left", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  // Check that the game is in progress
  if (roomState.game.state !== "in progress") {
    return res.status(400).send("game is not in progress");
  }

  // Calculate the time left in the game and return it to the player
  const timeLeft = roomState.game.timeLimit -
    (Date.now() - roomState.game.startTime);

  return res.status(200).send(JSON.stringify({ timeLeft }));
});

router.get("/api/:roomCode/game/category", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  return res.status(200).send(
    JSON.stringify({ category: roomState.game.category }),
  );
});

router.post("/api/:roomCode/game/ask", async (req, res) => {
  const { question } = req.body;

  // Bad request if question is not in the JSON
  if (!question) {
    return res.status(400).send("invalid data");
  }

  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  // Check that the game is in progress
  if (roomState.game.state !== "in progress") {
    return res.status(400).send("game is not in progress");
  }

  // Ask the ai
  const answer = await askClosedEndedQuestion(
    roomState.game.secretTerm,
    roomState.game.category,
    question,
  );

  // AI doesn't want to answer the question because it sucks
  if (!answer) {
    return res.status(400).send("no answer from ai");
  }

  // Log the interaction
  if (player.uid in roomState.game.playerStats) {
    roomState.game.playerStats[player.uid].interactions.push({
      question,
      answer,
    });
  }

  return res.status(200).send(JSON.stringify({ answer }));
});

router.post("/api/:roomCode/game/guess", async (req, res) => {
  const { guess } = req.body as { guess: string };

  // Bad request if guess is not in the JSON
  if (!guess) {
    return res.status(400).send("invalid data");
  }

  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  // Check that the game is in progress
  if (roomState.game.state !== "in progress") {
    return res.status(400).send("game is not in progress");
  }

  // Log the guess
  if (player.uid in roomState.game.playerStats) {
    roomState.game.playerStats[player.uid].guesses.push(guess);
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
    roomState.game.secretTerm.toLowerCase(),
  ) / Math.max(guess.length, roomState.game.secretTerm.length));

  // Player won the game
  if (proximity === 1) {
    // Clear the endTimeout to prevent it from ending the next game prematurely
    clearTimeout(roomState.game.endTimeout);
    // Set the winner
    roomState.game.winner = player.uid;
    // Set the game state to idle
    roomState.game.state = "idle";
    // Tell every player the game has ended
    io.to(roomCode).emit("room-game-end");
  }

  return res.status(200).send(JSON.stringify({ proximity }));
});

router.get("/api/:roomCode/game/winner", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  // Check that the game has ended
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

router.get("/api/:roomCode/game/secret-term", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  // Check that the game has ended
  if (roomState.game.state !== "idle") {
    return res.status(400).send("game has not ended");
  }

  return res.status(200).send(
    JSON.stringify({ secretTerm: roomState.game.secretTerm }),
  );
});

router.get("/api/:roomCode/game/interactions", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  // Check that the game is in progress
  if (roomState.game.state !== "in progress") {
    return res.status(400).send("game is not in progress");
  }

  // Get the interactions if they exist, otherwise empty list
  const interactions = uid in roomState.game.playerStats
    ? roomState.game.playerStats[uid].interactions
    : [];

  return res.status(200).send(JSON.stringify({ interactions }));
});

router.get("/api/:roomCode/game/player-stats", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const roomCode = req.params.roomCode;

  // Check if the room state exists
  if (!(`room:${roomCode}` in state)) {
    return res.status(400).send("room not found");
  }

  const roomState = state[`room:${roomCode}`] as Room;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Check if player is in the room
  if (player.room !== roomCode) {
    return res.status(400).send("you are not in this room");
  }

  // Check that the game has ended
  if (roomState.game.state !== "idle") {
    return res.status(400).send("game has not ended");
  }

  // Get sanitized player stats
  const playerStatsSanitized: Record<string, PlayerStatsSanitized> = {};
  Object.entries(roomState.game.playerStats).forEach(([uid, playerStats]) => {
    // Check if player state exists
    if (!(`player:${uid}` in state)) return;
    playerStatsSanitized[uid] = getSanitizedPlayerStats(playerStats);
  });

  return res.status(200).send(
    JSON.stringify({ playerStats: playerStatsSanitized }),
  );
});

export default router;
