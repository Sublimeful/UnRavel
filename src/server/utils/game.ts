import { io } from "../socket.ts";
import state from "../state.ts";
import type { Room } from "../types.ts";
import { changeUserELO, getUserELO } from "./db.ts";

export async function gameEnd(roomCode: string, winner: string | null) {
  const roomState = state[`room:${roomCode}`] as Room;

  if (!roomState) return;

  // Clear the endTimeout to prevent it from ending the next game prematurely
  clearTimeout(roomState.game.endTimeout);
  // Set the winner
  roomState.game.winner = winner;
  // Set the game state to idle
  roomState.game.state = "idle";
  // Tell every player the game has ended
  io.to(roomCode).emit("room-game-end");

  const players = new Set(Object.keys(roomState.game.playerStats));

  if (roomState.type === "ranked") {
    if (winner) {
      const winnerELO = await getUserELO(winner);
      const winELO = Math.ceil(1000 / (.00039 * Math.pow(winnerELO, 2) + 10));
      changeUserELO(winner, winELO);
    }

    for (const loser of players) {
      // Don't change the elo if the player is the winner or if the player has
      // left the game, because leaving the game already makes you lose elo
      if (loser === winner || !roomState.players.has(loser)) continue;
      const loserELO = await getUserELO(loser);
      const loseELO = Math.floor(
        100 - 100 * Math.pow(Math.E, -0.001 * loserELO),
      );
      changeUserELO(loser, -loseELO);
    }
  }
}
