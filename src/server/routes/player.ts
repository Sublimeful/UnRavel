import { Router } from "express";

import state from "../state.ts";

import { getSanitizedPlayer } from "../utils/misc.ts";
import type { Player } from "../types.ts";
import { verifySessionCookie } from "../utils/auth.ts";

const router = Router();

router.post("/api/player-sign-in", async (req, res) => {
  const { username } = req.body;

  // Bad request if username is not in the JSON
  if (!username) return res.status(400).send("invalid data");

  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;
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
  if (!req.cookies || !req.cookies.session) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies.session);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  const uid = decodedClaims.uid;

  // Sanitize the data before sending it to the user
  return res.status(200).send(
    JSON.stringify(getSanitizedPlayer(state[`player:${uid}`] as Player)),
  );
});

export default router;
