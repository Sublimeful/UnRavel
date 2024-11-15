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
  if (csrfToken !== req.cookies.csrfToken) {
    res.status(401).send("unauthorized request");
    return;
  }

  try {
    // Set session expiration to 1 day
    const expiresIn = 60 * 60 * 24;

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    const options = { maxAge: expiresIn, httpOnly: true, secure: true };

    res.cookie("session", sessionCookie, options);

    res.status(200).send();
  } catch (error) {
    return res.status(400).send(error);
  }
});

export default router;
