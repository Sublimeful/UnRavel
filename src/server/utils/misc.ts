import { io } from "../socket.ts";
import type { Player, PlayerStats } from "../types.ts";
import type { PlayerSanitized, PlayerStatsSanitized } from "../../types.ts";

export function getSocketFromAuthHeader(authHeader: string | undefined) {
  if (authHeader && authHeader.startsWith("SID ")) {
    const sid = authHeader.substring(4);

    // Get the associated socket
    const socket = io.sockets.sockets.get(sid);

    // Bad request if socket does not exist
    if (!socket) return null;

    return socket;
  } else {
    return null;
  }
}

export function getSanitizedPlayer(player: Player): PlayerSanitized {
  return { id: player.id, username: player.username };
}

export function getSanitizedPlayerStats(
  playerStats: PlayerStats,
): PlayerStatsSanitized {
  return {
    interactions: playerStats.interactions,
    guesses: playerStats.guesses,
  };
}
