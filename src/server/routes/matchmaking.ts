import { Router } from "express";
import { io } from "../socket.ts";
import { verifyRequestAndGetUID } from "../utils/api.ts";
import state from "../state.ts";
import type { MatchmakingQueue, Player, Room } from "../types.ts";
import randomCategories from "../../RandomCategories.json" with {
  type: "json",
};
import { generateSecretTermFromCategory } from "../utils/ai.ts";

const router = Router();

router.post("/api/matchmaking-queue-enter", async (req, res) => {
  const { sid } = req.body;

  // Bad request
  if (!sid) {
    return res.status(400).send("invalid data");
  }

  const uid = await verifyRequestAndGetUID(req, res);
  if (!uid) return;

  if (!(`player:${uid}` in state)) {
    return res.status(400).send("could not find player");
  }

  const matchmakingQueue = state["matchmaking-queue"] as MatchmakingQueue;

  matchmakingQueue.enqueue({ uid, sid, priority: 0 });

  return res.status(200).send();
});

// Matchmaking Logic
setInterval(async () => {
  const matchmakingQueue = state["matchmaking-queue"] as MatchmakingQueue;

  function roomCodeGenerator() {
    return Math.random().toString(36).slice(2).toUpperCase();
  }

  function getRandomCategory() {
    return randomCategories[
      Math.floor(Math.random() * randomCategories.length)
    ];
  }

  function getPlayerFromQueue() {
    while (!matchmakingQueue.isEmpty()) {
      const qPlayer = matchmakingQueue.pop();

      // Could not find player
      if (!(`player:${qPlayer.uid}` in state)) continue;

      // Remove from queue if player is in another room
      if ((state[`player:${qPlayer.uid}`] as Player).room) return;

      // Socket is not connected, user may have closed the tab
      const socket = io.sockets.sockets.get(qPlayer.sid);
      if (!socket) continue;

      return qPlayer;
    }
    return null;
  }

  if (matchmakingQueue.size() >= 2) {
    // Match the top 2 highest priority people
    const qPlayer1 = getPlayerFromQueue();
    const qPlayer2 = getPlayerFromQueue();

    // Could not get a pair of players
    if (!qPlayer1 || !qPlayer2) {
      // If player1 is active still, place them back in the queue
      if (qPlayer1) {
        matchmakingQueue.enqueue(qPlayer1);
      }

      return;
    }

    // Get a random room code
    let roomCode = roomCodeGenerator();
    while (`room:${roomCode}` in state) roomCode = roomCodeGenerator();

    // Get random category
    const category = getRandomCategory();

    // Initialize the room state
    const roomState: Room = {
      type: "ranked",
      maxPlayers: 2,
      players: new Set<string>([qPlayer1.uid, qPlayer2.uid]),
      host: null,
      // Initialize the game state
      game: {
        state: "in progress", // Immediately begin the game
        category,
        secretTerm: "",
        playerStats: {},
        timeLimit: 1000 * 60 * 15, // 15 minutes
        startTime: 0,
        winner: null,
      },
    };

    // Initialize player stats
    roomState.players.forEach((uid) => {
      if (!(`player:${uid}` in state)) return;
      const _player = state[`player:${uid}`] as Player;
      roomState.game.playerStats[uid] = {
        username: _player.username,
        interactions: [],
        guesses: [],
      };
    });

    // Generate the secret term
    const secretTerm = await generateSecretTermFromCategory(category);

    // Something went wrong while generating the secret term
    if (!secretTerm) {
      // Place both players back in queue
      matchmakingQueue.enqueue(qPlayer1);
      matchmakingQueue.enqueue(qPlayer2);
      return;
    }

    // Make both players join the room
    const socket1 = io.sockets.sockets.get(qPlayer1.sid);
    const socket2 = io.sockets.sockets.get(qPlayer2.sid);
    if (!socket1 || !socket2) {
      if (socket1) {
        // If player1 is active still, place them back in the queue
        matchmakingQueue.enqueue(qPlayer1);
      } else {
        // If player2 is active still, place them back in the queue
        matchmakingQueue.enqueue(qPlayer2);
      }
      return;
    }
    socket1.join(roomCode);
    socket2.join(roomCode);
    const player1 = state[`player:${qPlayer1.uid}`] as Player;
    const player2 = state[`player:${qPlayer2.uid}`] as Player;
    player1.room = roomCode;
    player2.room = roomCode;
    console.log(
      `player ${player1.uid} ${player1.username} has joined room ${roomCode}`,
    );
    console.log(
      `player ${player2.uid} ${player2.username} has joined room ${roomCode}`,
    );

    // Set the room in state
    state[`room:${roomCode}`] = roomState;

    // Set the game state secretTerm
    roomState.game.secretTerm = secretTerm;
    console.log(roomCode, "category", category, "secret term", secretTerm);

    // Set the game start time
    roomState.game.startTime = Date.now();

    // Tell every player the game has started
    io.to(roomCode).emit("room-game-start");

    // The game will end when the timer runs out
    roomState.game.endTimeout = setTimeout(() => {
      // Set the game state to idle
      roomState.game.state = "idle";
      // Tell every player the game has ended
      io.to(roomCode).emit("room-game-end");
    }, roomState.game.timeLimit);
  }

  if (matchmakingQueue.size() >= 2) {
    // Push the lowest priority player up
    const qPlayer = getPlayerFromQueue();

    if (qPlayer) {
      qPlayer.priority++;
      matchmakingQueue.enqueue(qPlayer);
    }
  }
}, 1000);

export default router;
