import { db } from "../firebase.ts";
import { io } from "../socket.ts";
import state from "../state.ts";
import type { Room } from "../types.ts";

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

  const players = Object.keys(roomState.game.playerStats);
  const loser = players.find((uid) => uid !== winner);

  if (roomState.type === "ranked" && winner && loser) {
    const winnerRef = db.collection("users").doc(winner);
    const loserRef = db.collection("users").doc(loser);
    const winnerDoc = await winnerRef.get();
    const loserDoc = await loserRef.get();

    const winnerELO = winnerDoc.exists ? winnerDoc.get("elo") : 0;
    const loserELO = loserDoc.exists ? loserDoc.get("elo") : 0;

    const winELO = Math.ceil(1000 / (.00039 * Math.pow(winnerELO, 2) + 10));
    const loseELO = Math.floor(100 - 100 * Math.pow(Math.E, -0.001 * loserELO));

    if (!winnerDoc.exists) {
      winnerRef.set({ elo: winELO });
    } else {
      winnerRef.update("elo", winnerELO + winELO);
    }

    if (!loserDoc.exists) {
      loserRef.set({ elo: 0 });
    } else if (loseELO > 0) {
      loserRef.update("elo", loserELO - loseELO);
    }
  }
}
