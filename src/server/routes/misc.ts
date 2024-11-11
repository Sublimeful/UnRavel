import { Router } from "express";

import state from "../state.ts";

import { getSocketFromAuthHeader } from "../utils/misc.ts";
import { io } from "../socket.ts";
import type { Player } from "../types.ts";

const router = Router();

router.post("/player-sign-in", (req, res) => {
  function playerIdGenerator() {
    return Math.random().toString(36).slice(2).toUpperCase();
  }

  const { username } = req.body;

  // Bad request if username is not in the json
  if (!username) return res.status(400).send("invalid data");

  // Validate and get socket
  const socket = getSocketFromAuthHeader(req.headers.authorization);

  // Bad request
  if (!socket) return res.status(400).send("could not authenticate client");

  console.log(socket.id, "player-sign-in", "username", username);

  // Initialize player state
  const allPlayerIds = new Set(
    io.sockets.sockets.keys().map((sid) => {
      if (`player:${sid}` in state) {
        return (state[`player:${sid}`] as Player).id;
      }
      return null;
    }),
  );
  let playerId = playerIdGenerator();
  while (playerId in allPlayerIds) playerId = playerIdGenerator();
  state[`player:${socket.id}`] = {
    id: playerId,
    username,
  };

  return res.status(200).send();
});

export default router;
