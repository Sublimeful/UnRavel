import type { SID } from "../types";

export interface Player {
  username: string
}

export interface Room {
  players: Set<SID>,
  host: SID,
}
