import { Router } from "express";
import { verifyRequestAndGetUID } from "../utils/api.ts";
import { getRankings, getUserRank } from "../utils/db.ts";

const router = Router();

router.get("/api/rankings", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const rankings = await getRankings();

  // Sanitize the data before sending it to the user
  return res.status(200).send(rankings);
});

router.get("/api/rank", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const rank = await getUserRank(uid);

  // Sanitize the data before sending it to the user
  return res.status(200).send({ rank });
});

export default router;
