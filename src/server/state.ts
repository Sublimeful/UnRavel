import { MaxPriorityQueue } from "@datastructures-js/priority-queue";

// TODO: Switch to redis?
const state: Record<string, any> = {};

state["matchmaking:queue"] = new MaxPriorityQueue();
state["matchmaking:dequeue"] = new Set();

export default state;
