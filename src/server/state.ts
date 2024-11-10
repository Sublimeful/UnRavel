import type { Player, Room } from "./types";

// TODO: Switch to redis?
const state: Record<string, Room | Player> = {};
export default state;
