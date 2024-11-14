import type { Interaction, PlayerID, SID } from "../types";

export interface Player {
  id: PlayerID;
  username: string;
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
  playerStats: Record<SID, PlayerStats>;
  timeLimit: number;
  endTimeout: NodeJS.Timeout;
  startTime: number;
  winner: SID | null;
}

export interface Room {
  players: Set<SID>;
  host: SID | null;
  game: Game;
}
