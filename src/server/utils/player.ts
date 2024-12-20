import type { Player, PlayerStats } from "../types.ts";
import type { PlayerSanitized, PlayerStatsSanitized } from "../../types.ts";

export function getSanitizedPlayer(player: Player): PlayerSanitized {
  return { uid: player.uid, username: player.username };
}

export function getSanitizedPlayerStats(
  playerStats: PlayerStats,
): PlayerStatsSanitized {
  return {
    username: playerStats.username,
    interactions: playerStats.interactions,
    guesses: playerStats.guesses,
    elo: playerStats.elo,
  };
}
