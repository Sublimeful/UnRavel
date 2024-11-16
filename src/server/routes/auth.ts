import { Router } from "express";
import { auth } from "../firebase.ts";

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
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);

    return res.status(401).send("unauthorized request");
  }
});

export default router;
