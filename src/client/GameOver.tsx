import { useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import Room from "./Room";
import { socket } from "./socket";
import type { PlayerSanitized, PlayerStatsSanitized } from "../types";
import {
  gameGetCategory,
  gameGetPlayerStats,
  gameGetSecretTerm,
  gameGetWinner,
} from "./api/game";
import { roomGetPlayers, roomLeave } from "./api/room";
import { getPlayer } from "./api/player";
import Game from "./Game";

interface GameOverProps {
  roomCode: string;
}

export default function GameOver(props: GameOverProps) {
  const { roomCode } = props;
  const { setPage } = useContext(PageContext);
  const [player, setPlayer] = useState<PlayerSanitized | null>(null);
  const [players, setPlayers] = useState<PlayerSanitized[]>([]);
  const [playerStats, setPlayerStats] = useState<
    Record<string, PlayerStatsSanitized>
  >({});
  const [category, setCategory] = useState("");
  const [winner, setWinner] = useState<PlayerSanitized | null>(null);
  const [secretTerm, setSecretTerm] = useState("");

  useEffect(() => {
    if (!socket.id) return;
    gameGetPlayerStats(roomCode).then((_playerStats) => {
      if (_playerStats) setPlayerStats(_playerStats);
    });
    gameGetCategory(roomCode).then((_category) => {
      if (_category) setCategory(_category);
    });
    gameGetWinner(roomCode).then((_winner) => {
      if (_winner) setWinner(_winner);
    });
    gameGetSecretTerm(roomCode).then((_secretTerm) => {
      if (_secretTerm) setSecretTerm(_secretTerm);
    });
  }, []);

  useEffect(() => {
    function updatePlayerList() {
      if (!socket.id) return;
      getPlayer().then((_player) => {
        if (_player) setPlayer(_player);
      });
      roomGetPlayers(roomCode).then((_players) => {
        if (_players) setPlayers(_players);
      });
    }

    function onceGameStarts() {
      // Switch to the game page when the game starts again
      setPage(<Game roomCode={roomCode} />);
    }

    socket.once("room-game-start", onceGameStarts);
    socket.on("room-player-left", updatePlayerList);

    updatePlayerList(); // Initially update the player list

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("room-game-start", onceGameStarts);
      socket.off("room-player-left", updatePlayerList);
    };
  }, []);

  return (
    <div className="absolute transition-[height,width] h-[98%] w-[98%] max-w-3xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-1">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => setPage(<Room roomCode={roomCode} />)}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Back to Room
        </button>
        <img src="logo.png" className="w-12 aspect-square" />
      </div>
      <h1 className="text-5xl font-bold text-center">
        <span className="text-cyan-400">Game</span>{" "}
        <span className="text-red-500">Over</span>
      </h1>
      <h1 className="flex justify-center items-center gap-2 text-2xl">
        {winner
          ? <i className="mr-1 text-3xl text-yellow-400 bi bi-trophy-fill"></i>
          : (
            <i className="mr-1 text-3xl text-yellow-400 bi bi-emoji-frown-fill">
            </i>
          )}
        <span className="max-w-[50%] text-nowrap break-all truncate">
          {winner ? winner.username : "Nobody"}
        </span>
        Wins!
      </h1>
      <div className="flex-[3_0_0] flex flex-col min-h-40 gap-2 mt-3 p-2 bg-[#333333] bg-opacity-80 rounded-lg overflow-y-scroll">
        <h1 className="m-auto text-xl text-center">The secret term was:</h1>
        <h1 className="m-auto text-3xl font-semibold text-cyan-400 text-center text-wrap break-all">
          {secretTerm}
        </h1>
        <h1 className="m-auto text-center text-wrap break-all">
          Category: {category}
        </h1>
      </div>
      <div className="flex-[7_0_0] flex flex-col items-center mt-3 px-5 bg-[#333333] bg-opacity-60 rounded-lg">
        <h1 className="flex-[1_0_0] min-h-14 max-h-14 self-start text-lg flex items-center">
          Game Stats
        </h1>
        <ul className="flex-[3_0_0] min-h-40 w-full flex flex-col gap-2 overflow-y-scroll">
          {players.sort((a, b) => {
            if (player && (player.uid === a.uid || player.uid === b.uid)) {
              return (b.uid === player.uid) ? 1 : -1;
            } else {
              return a.username.localeCompare(b.username);
            }
          }).map((_player) =>
            // Make sure playerStats[_player.id] exists before we start indexing and getting their stats
            // playerStats[_player.id] can be undefined if we got the player list before the player stats
            (_player.uid in playerStats) && (
              <li
                key={_player.uid}
                className="flex flex-row gap-6 justify-between w-full bg-[#595959] bg-opacity-60 rounded-lg px-3 py-2"
              >
                <span className="flex-[1_0_0] text-nowrap break-all truncate">
                  {_player.username}
                </span>
                <div className="max-w-max flex flex-row gap-2 text-[#C0C0C0]">
                  {player && (
                    <h1 className="flex flex-row gap-1">
                      <span className="max-w-16 text-nowrap break-all truncate">
                        {playerStats[_player.uid].interactions.length}
                      </span>{" "}
                      {playerStats[_player.uid].interactions.length === 1
                        ? "question"
                        : "questions"}
                    </h1>
                  )}
                  <h1>•</h1>
                  {player && (
                    <h1 className="flex flex-row gap-1">
                      <span className="max-w-16 text-nowrap break-all truncate">
                        {playerStats[_player.uid].guesses.length}
                      </span>{" "}
                      {playerStats[_player.uid].guesses.length === 1
                        ? "guess"
                        : "guesses"}
                    </h1>
                  )}
                </div>
              </li>
            )
          )}
        </ul>
        <h1 className="flex-[1_0_0] min-h-14 max-h-14 p-4 text-lg w-full text-center text-nowrap break-all truncate">
          Total Questions: {Object.values(playerStats).map(({ interactions }) =>
            interactions.length
          ).reduce((a, b) =>
            a + b, 0)}
        </h1>
      </div>
      <button
        onClick={() => {
          if (socket.id) roomLeave(socket.id, roomCode); // Leave room before returning to main menu
          setPage(<MainMenu />);
        }}
        className="flex-[1_0_0] mt-3 min-h-10 bg-[#333333] bg-opacity-80 rounded-lg flex justify-center items-center gap-2"
      >
        Main Menu<i className="bi bi-house-door"></i>
      </button>
    </div>
  );
}
