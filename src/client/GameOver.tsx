import { useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import Room from "./Room";
import { socket } from "./socket";
import type { PlayerSanitized, RoomCode } from "../types";
import {
  gameGetCategory,
  gameGetSecretPhrase,
  gameGetWinner,
  getPlayer,
  roomGetPlayers,
  roomLeave,
} from "./api";

interface GameOverProps {
  roomCode: RoomCode;
}

export default function GameOver(props: GameOverProps) {
  const { roomCode } = props;
  const { setPage } = useContext(PageContext);
  const [player, setPlayer] = useState<PlayerSanitized | null>(null);
  const [players, setPlayers] = useState<PlayerSanitized[]>([]);
  const [category, setCategory] = useState("");
  const [winner, setWinner] = useState<PlayerSanitized | null>(null);
  const [secretPhrase, setSecretPhrase] = useState("");

  useEffect(() => {
    if (!socket.id) return;
    gameGetCategory(socket.id, roomCode).then((_category) => {
      if (_category) setCategory(_category);
    });
    gameGetWinner(socket.id, roomCode).then((_winner) => {
      if (_winner) setWinner(_winner);
    });
    gameGetSecretPhrase(socket.id, roomCode).then((_secretPhrase) => {
      if (_secretPhrase) setSecretPhrase(_secretPhrase);
    });
  }, []);

  useEffect(() => {
    function updatePlayerList() {
      if (!socket.id) return;
      getPlayer(socket.id).then((_player) => {
        if (_player) setPlayer(_player);
      });
      roomGetPlayers(socket.id, roomCode).then((_players) => {
        if (_players) setPlayers(_players);
      });
    }

    socket.on("room-player-left", updatePlayerList);

    updatePlayerList(); // Initially update the player list

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("room-player-left", updatePlayerList);
    };
  }, []);

  return (
    <div className="absolute transition-[height,width] lg:h-[90%] h-[98%] w-[98%] max-w-3xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-1">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => setPage(<Room roomCode="test" />)}
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
      <h1 className="flex justify-center items-center gap-3 text-2xl">
        <i className="text-3xl text-yellow-400 bi bi-trophy-fill"></i>
        {winner ? winner.username : ""} Wins!
      </h1>
      <div className="flex-[3] flex flex-col justify-center items-center gap-2 mt-3 p-2 bg-[#333333] bg-opacity-80 rounded-lg">
        <h1 className="text-xl">The secret phrase was:</h1>
        <h1 className="text-3xl font-semibold text-cyan-400">{secretPhrase}</h1>
        <h1>Category: {category}</h1>
      </div>
      <div className="flex-[7] flex flex-col items-center mt-3 px-5 bg-[#333333] bg-opacity-60 rounded-lg">
        <h1 className="flex-1 self-start text-lg flex items-center">
          Game Stats
        </h1>
        <ul className="w-full flex flex-col gap-2">
          {players.map((_player) =>
            (player && _player.id === player.id)
              ? (
                <li
                  key={_player.id}
                  className="flex flex-row justify-between w-full bg-[#595959] bg-opacity-60 rounded-lg px-3 py-2"
                >
                  You
                </li>
              )
              : (
                <li
                  key={_player.id}
                  className="flex flex-row justify-between w-full bg-[#595959] bg-opacity-60 rounded-lg px-3 py-2"
                >
                  {_player.username}
                </li>
              )
          )}
        </ul>
        <h1 className="flex-1 text-lg flex items-center">Total Questions: 8</h1>
      </div>
      <button
        onClick={() => {
          if (socket.id) roomLeave(socket.id, roomCode); // Leave room before returning to main menu
          setPage(<MainMenu />);
        }}
        className="flex-1 mt-3 min-h-10 bg-[#333333] bg-opacity-80 rounded-lg flex justify-center items-center gap-2"
      >
        Main Menu<i className="bi bi-house-door"></i>
      </button>
    </div>
  );
}
