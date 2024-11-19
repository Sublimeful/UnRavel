import { Router } from "express";

import state from "../state.ts";

import { getSanitizedPlayer } from "../utils/player.ts";
import type { Player } from "../types.ts";
import { verifyRequestAndGetUID } from "../utils/api.ts";

const router = Router();

router.post("/api/player-sign-in", async (req, res) => {
  const { username } = req.body;

  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;
  console.log(uid, "player-sign-in", "username", username);

  // Player has already signed in before
  if (`player:${uid}` in state) {
    // Just change the username only
    const player = state[`player:${uid}`] as Player;
    player.username = username;

    return res.status(200).send();
  }

  // Initialize player state
  state[`player:${uid}`] = { uid, username, room: null };

  return res.status(200).send();
});

router.get("/api/player", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  // Sanitize the data before sending it to the user
  return res.status(200).send(
    JSON.stringify(getSanitizedPlayer(state[`player:${uid}`] as Player)),
  );
});

export default router;
