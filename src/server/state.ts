import {
  MaxPriorityQueue,
  MinPriorityQueue,
} from "@datastructures-js/priority-queue";
import type { MatchmakingQueue, MatchmakingRequestQueue } from "./types";

// TODO: Switch to redis?
const state: Record<string, any> = {};

state["matchmaking:queue"] = new MaxPriorityQueue((qPlayer) =>
  qPlayer.priority
) as MatchmakingQueue;
state["matchmaking:request"] = new MinPriorityQueue((request) =>
  request.timestamp
) as MatchmakingRequestQueue;

export default state;
