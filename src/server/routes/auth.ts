import { Router } from "express";
import { verifyRequestAndGetUID } from "../utils/api.ts";
import state from "../state.ts";
import {
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
  verifySessionCookie,
} from "../utils/auth.ts";
import {
  createUser,
  getUserByUid,
  getUserByUsername,
} from "../utils/db.ts";

const router = Router();

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24;

router.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  // Bad request
  if (!username || !password) {
    return res.status(400).send("invalid data");
  }

  if (username.length > 50) {
    return res.status(400).send("username too long");
  }

  if (password.length < 8 || password.length > 100) {
    return res.status(400).send("password must be 8 to 100 characters");
  }

  // Username already taken
  if (getUserByUid(username) || getUserByUsername(username)) {
    return res.status(409).send("username already taken");
  }

  try {
    createUser(username, username, hashPassword(password));
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send("could not register");
  }
});

router.post("/api/auth/signin", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  // Bad request
  if (!username || !password) {
    return res.status(400).send("invalid data");
  }

  const user = getUserByUid(username) ?? getUserByUsername(username);

  // User does not exist or password is wrong
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).send("invalid username or password");
  }

  const sessionToken = createSession(user.uid);

  res.cookie("session", sessionToken, {
    maxAge: SESSION_DURATION_MS,
    httpOnly: true,
    secure: process.env["COOKIE_SECURE"] === "true",
    // Maximum security sameSite restriction
    // Cookie will not be included in any cross-site requests
    sameSite: "strict",
  });

  return res.status(200).send();
});

router.post("/api/auth/signout", async (req, res) => {
  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  const token = req.cookies["session"];
  if (token) deleteSession(token);

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
  if (!req.cookies || !req.cookies["session"]) {
    return res.status(401).send("unauthorized request");
  }

  const decodedClaims = await verifySessionCookie(req.cookies["session"]);

  if (!decodedClaims) {
    return res.status(401).send("unauthorized request");
  }

  return res.status(200).send(JSON.stringify({ uid: decodedClaims.uid }));
});

export default router;