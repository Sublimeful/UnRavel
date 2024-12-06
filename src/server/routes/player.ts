import { Router } from "express";

import state from "../state.ts";

import { getSanitizedPlayer } from "../utils/player.ts";
import type { Player } from "../types.ts";
import { verifyRequestAndGetUID } from "../utils/api.ts";
import { db } from "../firebase.ts";
import { getUserELO } from "../utils/db.ts";

const router = Router();

router.post("/api/player-sign-in", async (req, res) => {
  const { username } = req.body;

  // Bad request
  if (!username) return res.status(400).send("invalid data");

  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;
  console.log(uid, "player-sign-in", "username", username);

  // Update username in db
  const userRef = db.collection("users").doc(uid);
  userRef.get().then((userDoc) => {
    if (!userDoc.exists) {
      userRef.set({ username });
    } else {
      userRef.update("username", username);
    }
  });

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

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  // Sanitize the data before sending it to the user
  return res.status(200).send(
    JSON.stringify(getSanitizedPlayer(state[`player:${uid}`] as Player)),
  );
});

router.get("/api/elo", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const elo = await getUserELO(uid);

  return res.status(200).send(JSON.stringify({ elo }));
});

export default router;
