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
  state: "room" | "in progress" | "ended";
  category: string;
  secretPhrase: string;
  playerStats: Record<SID, PlayerStats>;
  timeLimit: number;
  startTime: number;
  winner: SID | null;
}

export interface Room {
  players: Set<SID>;
  host: SID | null;
  game: Game;
}
