import type { Interaction } from "../types";

export interface Player {
  uid: string;
  sid: string | null;
  username: string;
  room: string | null;
}

export interface PlayerStats {
  interactions: Interaction[];
  guesses: string[];
}

export interface Game {
  // idle: In the room or game over screen
  // in progress: Game is in progress
  state: "idle" | "in progress";
  category: string;
  secretTerm: string;
  playerStats: Record<string, PlayerStats>;
  timeLimit: number;
  endTimeout?: NodeJS.Timeout;
  startTime: number;
  winner: string | null;
}

export interface Room {
  players: Set<string>;
  host: string | null;
  game: Game;
}
