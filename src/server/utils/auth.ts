import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "./db.ts";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  storedHash: string,
): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");

  if (candidate.length !== expected.length) return false;

  return timingSafeEqual(candidate, expected);
}

export function createSession(uid: string): string {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();

  db.prepare(
    "INSERT INTO sessions (token, uid, created_at, expires_at) VALUES (?, ?, ?, ?)",
  ).run(token, uid, now, now + SESSION_DURATION_MS);

  return token;
}

export function deleteSession(token: string) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function verifySessionCookie(
  sessionCookie: string,
): Promise<{ uid: string } | null> {
  const row = db.prepare(
    "SELECT uid, expires_at FROM sessions WHERE token = ?",
  ).get(sessionCookie) as { uid: string; expires_at: number } | null;

  if (!row) return Promise.resolve(null);

  if (row.expires_at < Date.now()) {
    deleteSession(sessionCookie);
    return Promise.resolve(null);
  }

  return Promise.resolve({ uid: row.uid });
}