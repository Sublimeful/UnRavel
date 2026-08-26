import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = process.env["DATABASE_PATH"] ?? path.resolve("unravel.db");

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    elo INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  -- Usernames and uids are case-insensitive: no two users may differ
  -- only by letter case.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid_lower ON users (lower(uid));
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (lower(username));
`);

export interface UserRow {
  uid: string;
  username: string;
  password_hash: string;
  elo: number;
  created_at: number;
}

export function createUser(
  uid: string,
  username: string,
  passwordHash: string,
) {
  db.prepare(
    "INSERT INTO users (uid, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
  ).run(uid, username, passwordHash, Date.now());
}

export function getUserByUid(uid: string): UserRow | null {
  return db.prepare("SELECT * FROM users WHERE lower(uid) = lower(?)").get(uid) as
    unknown as
    | UserRow
    | null;
}

export function getUserByUsername(username: string): UserRow | null {
  return db.prepare(
    "SELECT * FROM users WHERE lower(username) = lower(?) OR lower(uid) = lower(?)",
  ).get(username, username) as unknown as
    | UserRow
    | null;
}

export function getUserELO(uid: string): number | null {
  try {
    const row = db.prepare("SELECT elo FROM users WHERE uid = ?").get(uid) as
      | { elo: number }
      | null;

    return row ? row.elo : 0;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function getUsername(uid: string): string | null {
  try {
    const row = db.prepare("SELECT username FROM users WHERE uid = ?").get(uid) as
      | { username: string }
      | null;

    return row ? row.username : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function setUsername(uid: string, username: string) {
  try {
    db.prepare("UPDATE users SET username = ? WHERE uid = ?").run(
      username,
      uid,
    );
  } catch (err) {
    console.error(err);
  }
}

export function changeUserELO(uid: string, deltaELO: number) {
  try {
    const userELO = getUserELO(uid);

    if (userELO === null) return;

    db.prepare("UPDATE users SET elo = ? WHERE uid = ?").run(
      userELO + deltaELO,
      uid,
    );
  } catch (err) {
    console.error(err);
  }
}

export function getUserRank(uid: string): number | null {
  try {
    const userELO = getUserELO(uid);

    if (userELO === null) return null;

    const row = db.prepare(
      `SELECT COUNT(*) AS count FROM users
       WHERE elo > ? OR (elo = ? AND uid < ?)`,
    ).get(userELO, userELO, uid) as { count: number };

    return row.count + 1;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function getRankings(): {
  uid: string;
  username?: string;
  elo?: number;
}[] {
  try {
    const rows = db.prepare(
      "SELECT uid, username, elo FROM users ORDER BY elo DESC, uid ASC LIMIT 50",
    ).all() as { uid: string; username: string; elo: number }[];

    return rows.map(({ uid, username, elo }) => ({ uid, username, elo }));
  } catch (err) {
    console.error(err);
    return [];
  }
}