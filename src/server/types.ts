import type { PlayerID, SID } from "../types";

export interface Player {
  id: PlayerID;
  username: string;
}

export interface Room {
  players: Set<SID>;
  host: SID;
  game: {
    state: "room" | "in progress" | "ended";
    secretPhrase: string;
    timeLimit: number;
    startTime: number;
  };
}
