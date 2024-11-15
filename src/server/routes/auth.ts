import { Router } from "express";

import { auth as firebaseAuth } from "../firebase.ts";

const router = Router();

router.post("/api/auth/register", async (req, res) => {
});

export default router;
