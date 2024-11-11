import type { SID } from "../types";

export interface Player {
  username: string;
}

export interface Room {
  players: Set<SID>;
  host: SID;
  game: {
    state: "room" | "in progress" | "ended";
    timeLimit: number;
    startTime: number;
  }
}
