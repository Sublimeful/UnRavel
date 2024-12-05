import { Router } from "express";
import { auth } from "../firebase.ts";
import { verifyRequestAndGetUID } from "../utils/api.ts";
import state from "../state.ts";

const router = Router();

router.post("/api/auth/signin-session", async (req, res) => {
  const { idToken, csrfToken } = req.body as {
    idToken: string;
    csrfToken: string;
  };

  // Bad request
  if (!idToken || !csrfToken) {
    return res.status(400).send("invalid data");
  }

  // Guard against CSRF attacks.
  if (!req.cookies || csrfToken !== req.cookies.csrfToken) {
    return res.status(401).send("unauthorized request");
  }

  try {
    // Set session expiration to 1 day
    const expiresIn = 1000 * 60 * 60 * 24;

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      // Maximum security sameSite restriction
      // Cookie will not be included in any cross-site requests
      sameSite: "strict",
    });

    return res.status(200).send();
  } catch (error) {
    console.error(error);

    return res.status(401).send("unauthorized request");
  }
});

router.post("/api/auth/signout", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  // Clear the cookie
  res.clearCookie("session");

  // Player has already signed in before
  if (`player:${uid}` in state) {
    // Delete the player
    delete state[`player:${uid}`];
  }

  return res.status(200).send();
});

router.get("/api/auth/session", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  return res.status(200).send(JSON.stringify({ uid }));
});

export default router;
