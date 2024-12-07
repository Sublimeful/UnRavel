import type {
  MaxPriorityQueue,
  MinPriorityQueue,
} from "@datastructures-js/priority-queue";
import type { Interaction } from "../types";

export interface Player {
  uid: string;
  username: string;
  room: string | null;
}

export interface PlayerStats {
  username: string;
  interactions: Interaction[];
  guesses: string[];
  elo: number | null;
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
  type: "custom" | "ranked";
  maxPlayers: number;
  players: Set<string>;
  host: string | null;
  game: Game;
}

export type MatchmakingQueue = MaxPriorityQueue<MatchmakingPlayer>;
export interface MatchmakingPlayer {
  uid: string;
  sid: string;
  priority: number;
}

export type MatchmakingRequestQueue = MinPriorityQueue<MatchmakingRequest>;
export interface MatchmakingRequest {
  type: "join" | "leave";
  timestamp: number;
  uid: string;
  sid: string | null;
}
