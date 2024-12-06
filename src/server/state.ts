import { MaxPriorityQueue } from "@datastructures-js/priority-queue";
import type { MatchmakingQueue, Player, Room } from "./types";

// TODO: Switch to redis?
const state: Record<string, Room | Player | MatchmakingQueue> = {};

state["matchmaking-queue"] = new MaxPriorityQueue();

export default state;
