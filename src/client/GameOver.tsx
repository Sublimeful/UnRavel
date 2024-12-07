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
import { roomGetType, roomLeave } from "./api/room";
import { getPlayer } from "./api/player";

interface GameOverProps {
  roomCode: string;
}

export default function GameOver(props: GameOverProps) {
  const { setPage } = useContext(PageContext);
  const { roomCode } = props;

  const [roomType, setRoomType] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerSanitized | null>(null);
  const [playerStats, setPlayerStats] = useState<
    Record<string, PlayerStatsSanitized>
  >({});
  const [category, setCategory] = useState<string | null>("");
  const [winner, setWinner] = useState<PlayerSanitized | null>(null);
  const [secretTerm, setSecretTerm] = useState<string | null>("");
  const [disableMainMenuBtn, setDisableMainMenuBtn] = useState(false);

  useEffect(() => {
    gameGetPlayerStats(roomCode).then((_playerStats) => {
      if (_playerStats) setPlayerStats(_playerStats);
    });
    gameGetCategory(roomCode).then(setCategory);
    gameGetWinner(roomCode).then(setWinner);
    gameGetSecretTerm(roomCode).then(setSecretTerm);
    roomGetType(roomCode).then(setRoomType);
  }, []);

  useEffect(() => {
    function updatePlayerList() {
      getPlayer().then(setPlayer);
    }

    updatePlayerList(); // Initially update the player list

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
    };
  }, []);

  function calculateWinELO(currELO: number) {
    return Math.ceil(1000 / (.00039 * Math.pow(currELO, 2) + 10));
  }

  function calculateLoseELO(currELO: number) {
    return Math.floor(100 - 100 * Math.pow(Math.E, -0.001 * currELO));
  }

  return (
    <div className="absolute transition-[height,width] h-[98%] w-[98%] max-w-3xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-1">
      <div
        className={`flex flex-row w-full ${
          roomType === "custom" ? "justify-between" : "justify-end"
        }`}
      >
        {roomType === "custom" &&
          (
            <button
              onClick={() => setPage(<Room roomCode={roomCode} />)}
              className="self-start text-lg font-light flex items-center justify-center gap-2"
            >
              <i className="bi bi-arrow-left"></i>Back to Room
            </button>
          )}
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
          {secretTerm ?? ""}
        </h1>
        <h1 className="m-auto text-center text-wrap break-all">
          Category: {category ?? ""}
        </h1>
      </div>
      <div className="flex-[7_0_0] flex flex-col items-center mt-3 px-5 bg-[#333333] bg-opacity-60 rounded-lg">
        <h1 className="flex-[1_0_0] min-h-14 max-h-14 self-start text-lg flex items-center">
          Game Stats
        </h1>
        <ul className="flex-[3_0_0] min-h-40 w-full flex flex-col gap-2 overflow-y-scroll">
          {Object.entries(playerStats).sort(
            ([uidA, playerStatsA], [uidB, playerStatsB]) => {
              if (player && (player.uid === uidA || player.uid === uidB)) {
                return (uidB === player.uid) ? 1 : -1;
              } else {
                return playerStatsA.username.localeCompare(
                  playerStatsB.username,
                );
              }
            },
          ).map(([uid, playerStats]) => (
            <li
              key={uid}
              className="flex flex-row items-center gap-6 justify-between w-full bg-[#595959] bg-opacity-60 rounded-lg px-3 py-2"
            >
              <span className="flex-[1_0_0] text-nowrap break-all truncate">
                {playerStats.username}
              </span>
              <div className="max-w-max flex flex-row gap-2 text-[#C0C0C0]">
                {player && (
                  <h1 className="flex flex-row items-center gap-1">
                    <span className="max-w-16 text-nowrap break-all truncate">
                      {playerStats.interactions.length}
                    </span>{" "}
                    {playerStats.interactions.length === 1
                      ? "question"
                      : "questions"}
                  </h1>
                )}
                <h1 className="flex items-center">•</h1>
                {player && (
                  <h1 className="flex flex-row items-center gap-1">
                    <span className="max-w-16 text-center break-all truncate">
                      {playerStats.guesses.length}
                    </span>{" "}
                    {playerStats.guesses.length === 1 ? "guess" : "guesses"}
                  </h1>
                )}
                {roomType === "ranked" && playerStats.elo !== null &&
                  (
                    <div className="flex flex-row items-center gap-2">
                      <span className="max-w-16 text-white font-semibold text-xl text-nowrap break-all truncate">
                        {playerStats.elo + ((winner && winner.uid === uid)
                          ? calculateWinELO(playerStats.elo)
                          : -calculateLoseELO(playerStats.elo))}
                      </span>
                      {winner && winner.uid === uid
                        ? (
                          <div className="flex flex-col font-semibold items-center text-green-500">
                            <i className="bi bi-graph-up-arrow"></i>
                            <span>{calculateWinELO(playerStats.elo)}</span>
                          </div>
                        )
                        : (
                          <div className="flex flex-col font-semibold items-center text-red-500">
                            <i className="bi bi-graph-down-arrow"></i>
                            <span>{calculateLoseELO(playerStats.elo)}</span>
                          </div>
                        )}
                    </div>
                  )}
              </div>
            </li>
          ))}
        </ul>
        <h1 className="flex-[1_0_0] min-h-14 max-h-14 p-4 text-lg w-full text-center text-nowrap break-all truncate">
          Total Questions: {Object.values(playerStats).map(({ interactions }) =>
            interactions.length
          ).reduce((a, b) =>
            a + b, 0)}
        </h1>
      </div>
      <button
        onClick={async () => {
          if (!socket.id) return;
          setDisableMainMenuBtn(true); // Prevent button spamming
          // If player successfully leaves the room, set page to main menu
          if (await roomLeave(socket.id, roomCode)) {
            setPage(<MainMenu />);
          } else {
            setDisableMainMenuBtn(false);
          }
        }}
        className="flex-[1_0_0] mt-3 min-h-10 bg-[#333333] bg-opacity-80 rounded-lg flex justify-center items-center gap-2"
        disabled={disableMainMenuBtn}
      >
        Main Menu<i className="bi bi-house-door"></i>
      </button>
    </div>
  );
}
