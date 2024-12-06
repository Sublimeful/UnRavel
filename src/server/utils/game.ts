import { io } from "../socket.ts";
import state from "../state.ts";
import type { Room } from "../types.ts";

export function gameEnd(roomCode: string, winner: string | null) {
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
}
