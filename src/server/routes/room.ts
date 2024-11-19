import { Router } from "express";

import { io } from "../socket.ts";

import state from "../state.ts";
import { getSanitizedPlayer } from "../utils/misc.ts";
import { generateSecretTermFromCategory } from "../utils/ai.ts";
import type { Player, Room } from "../types.ts";
import type { GameSettings } from "../../types.ts";
import { verifySessionCookie } from "../utils/auth.ts";

const router = Router();

router.get("/api/room-get", async (req, res) => {
  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  return res.status(200).send(JSON.stringify({ roomCode: player.room }));
});

router.post("/api/room-request", async (req, res) => {
  const { sid } = req.body;

  // Bad request
  if (!sid) return res.status(400).send("invalid data");

  function roomCodeGenerator() {
    return Math.random().toString(36).slice(2).toUpperCase();
  }

  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const player = state[`player:${uid}`] as Player;

  // Disallow if client is already in a room
  if (player.room) return;

  // Get a random room code
  let roomCode = roomCodeGenerator();
  while (`room:${roomCode}` in state) roomCode = roomCodeGenerator();

  // Initialize the room state
  const roomState: Room = {
    players: new Set<string>(),
    host: null,
    // Initialize the game state
    game: {
      state: "idle", // Either in the room or in the game over screen when the game ends
      category: "",
      secretTerm: "",
      playerStats: {},
      timeLimit: 1000 * 60 * 15, // 15 minutes for now, subject to change (i.e. through game settings)
      startTime: 0,
      winner: null,
    },
  };
  state[`room:${roomCode}`] = roomState;

  // Join the room
  console.log(
    `player ${player.uid} ${player.username} has joined room ${roomCode}`,
  );
  const socket = io.sockets.sockets.get(sid);
  if (!socket) {
    return res.status(400).send("invalid data");
  }
  socket.join(roomCode);
  roomState.players.add(player.uid);
  player.room = roomCode;

  // Set the player who created the room as the host
  roomState.host = player.uid;

  return res.status(200).send(JSON.stringify({ roomCode }));
});

router.post("/api/:roomCode/join", async (req, res) => {
  const { sid } = req.body;

  // Bad request
  if (!sid) return res.status(400).send("invalid data");

  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

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

  const socket = io.sockets.sockets.get(sid);
  if (!socket) {
    return res.status(400).send("invalid data");
  }

  // Check for reconnection
  if (player.room) {
    if (socket.rooms.has(player.room)) {
      return res.status(400).send("you are already in a room");
    } else {
      // Reconnect
      socket.join(roomCode);
      return res.status(200).send();
    }
  }

  // Join room
  console.log(
    `player ${player.uid} ${player.username} has joined room ${roomCode}`,
  );
  socket.join(roomCode);
  roomState.players.add(player.uid);
  player.room = roomCode;

  // Inform other players in the room of the added player
  io.to(roomCode).emit("room-player-joined");

  return res.status(200).send();
});

router.post("/api/:roomCode/leave", async (req, res) => {
  const { sid } = req.body;

  // Bad request
  if (!sid) return res.status(400).send("invalid data");

  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

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

  // Leave the room
  console.log(
    `player ${player.uid} ${player.username} has left room ${roomCode}`,
  );
  const socket = io.sockets.sockets.get(sid);
  if (!socket) {
    return res.status(400).send("invalid data");
  }
  socket.leave(roomCode);
  roomState.players.delete(player.uid);
  player.room = null;

  // If the host leaves the room, then transfer host to the next player
  // If there is no one to transfer, then the room is destroyed, don't need to handle that here
  if (roomState.host === player.uid && roomState.players.size > 0) {
    roomState.host = Array.from(roomState.players)[0];
  }

  // Inform other players in the room of the removed player
  io.to(roomCode).emit("room-player-left");

  // If the room is empty, then cull it
  if (roomState.players.size === 0) {
    console.log(`room ${roomCode} deleted`);
    delete state[`room:${roomCode}`];
  }

  return res.status(200).send();
});

router.get("/api/:roomCode/players", async (req, res) => {
  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

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

  // Retrieve the list of players
  const players: Set<string> = roomState.players;

  return res.status(200).send(JSON.stringify(
    Array.from(players).map((uid) => {
      // Return a sanitized list of player information
      return getSanitizedPlayer(state[`player:${uid}`] as Player);
    }),
  ));
});

router.get("/api/:roomCode/host", async (req, res) => {
  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

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

  // Get the host player
  const hostPlayer = state[`player:${roomState.host}`] as Player;

  return res.status(200).send(JSON.stringify(
    { host: hostPlayer.uid },
  ));
});

router.post("/api/:roomCode/start-game", async (req, res) => {
  const { category } = req.body as GameSettings;

  // Bad request if settings are not sent properly
  if (!category) {
    return res.status(400).send("invalid data");
  }

  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

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

  // Check that the game is in a state where it can be started
  if (roomState.game.state === "in progress") {
    return res.status(400).send(
      "you cannot start a new game while the current one is still in progress",
    );
  }

  // Check if player is the host
  if (roomState.host !== player.uid) {
    return res.status(400).send("you are not the room host");
  }

  // Set the game winner to null (nobody has won this new game yet)
  roomState.game.winner = null;

  // Set the game state category
  roomState.game.category = category;

  // Initialize player stats
  roomState.players.forEach((uid) => {
    roomState.game.playerStats[uid] = { interactions: [], guesses: [] };
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
