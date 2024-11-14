import { Server } from "socket.io";

import state from "./state.ts";
import type { Room } from "./types.ts";
import type { SID } from "../types.ts";

export const io = new Server({
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log(socket.id, "connection");
  socket.on("disconnect", () => {
    console.log(socket.id, "disconnect");
    // Delete the player data if there is player data
    if (`player:${socket.id}` in state) {
      delete state[`player:${socket.id}`];
    }
  });
});

io.sockets.adapter.on("join-room", (roomCode, sid) => {
  // Don't do anything if room is a socket.io room
  if (io.sockets.sockets.has(roomCode)) return;

  console.log(sid, "join-room", roomCode);

  // Add player
  const roomState = state[`room:${roomCode}`] as Room;
  const players: Set<SID> = roomState.players;

  players.add(sid);

  // If player is the only player in the room, then he is the room's host
  if (players.size === 1) {
    roomState.host = sid;
  }

  // Inform other players in the room of the added player
  io.to(roomCode).emit("room-player-joined");
});

io.sockets.adapter.on("leave-room", (roomCode, sid) => {
  // Don't do anything if room is a socket.io room
  if (io.sockets.sockets.has(roomCode)) return;

  console.log(sid, "leave-room", roomCode);

  // Remove player
  const roomState = state[`room:${roomCode}`] as Room;
  const players: Set<SID> = roomState.players;

  players.delete(sid);

  // If the host leaves the room, then transfer host to the next player
  // If there is no one to transfer, then the room is destroyed, don't need to handle that here
  if (roomState.host === sid && players.size > 0) {
    roomState.host = Array.from(players)[0];
  }

  // Inform other players in the room of the removed player
  io.to(roomCode).emit("room-player-left");
});

io.sockets.adapter.on("create-room", (roomCode) => {
  // Don't do anything if room is a socket.io room
  if (io.sockets.sockets.has(roomCode)) return;

  console.log("create-room", roomCode);

  // Initialize the room state
  state[`room:${roomCode}`] = {
    players: new Set<SID>(),
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
  } as Room;
});

io.sockets.adapter.on("delete-room", (roomCode) => {
  // Don't do anything if room is a socket.io room
  if (io.sockets.sockets.has(roomCode)) return;

  console.log("delete-room", roomCode);

  // Destroy the room state
  delete state[`room:${roomCode}`];
});

io.listen(5174);
