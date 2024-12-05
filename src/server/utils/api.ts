import type { Request, Response } from "express";
import { verifySessionCookie } from "./auth.ts";

export async function verifyRequestAndGetUID(
  req: Request,
  res: Response,
): Promise<string | null> {
  if (!req.cookies || !req.cookies["session"]) {
    res.status(401).send("unauthorized request");
    return null;
  }

  const decodedClaims = await verifySessionCookie(req.cookies["session"]);

  if (!decodedClaims) {
    res.status(401).send("unauthorized request");
    return null;
  }

  return decodedClaims.uid;
}
