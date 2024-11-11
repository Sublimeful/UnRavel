import { useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import { roomGetPlayers, roomLeave } from "./api";
import { socket } from "./socket";
import type { PlayerSanitized, RoomCode } from "../types";

interface RoomProps {
  roomCode: RoomCode;
}

export default function Room(props: RoomProps) {
  const { setPage } = useContext(PageContext);
  const { roomCode } = props;

  const [players, setPlayers] = useState<PlayerSanitized[]>([]);

  useEffect(() => {
    function updatePlayerList() {
      if (!socket.id) return;
      roomGetPlayers(socket.id, roomCode).then((_players) => {
        if (_players) setPlayers(_players);
      });
    }

    updatePlayerList(); // Initially update the player list

    socket.on("room-player-joined", () => {
      updatePlayerList();
    });

    socket.on("room-player-left", () => {
      updatePlayerList();
    });
  }, []);

  return (
    <div className="absolute transition-[width] h-[98%] lg:w-[50%] w-[98%] bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center p-10 text-white overflow-y-scroll overflow-x-clip">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => {
            if (socket.id) roomLeave(socket.id, roomCode); // Back button pressed leaves room
            setPage(<MainMenu />);
          }}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Back to Menu
        </button>
        <img src="logo.png" className="w-24 aspect-square" />
      </div>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#55CED2] to-[#DB1F3C]">
        Room Lobby
      </h1>
      <label className="w-full relative mt-3">
        Room Code
        <input
          type="text"
          className="text-xl w-full h-14 p-5 bg-[#343434] rounded-lg border border-[#787878] mt-1"
          value={roomCode}
          disabled
        />
        <i
          onClick={() => {
            navigator.clipboard.writeText(roomCode);
          }}
          className="bi bi-copy text-white text-xl absolute right-5 top-11 cursor-pointer"
        />
      </label>
      <div className="w-full flex flex-col mt-3 bg-[#343434] border border-[#787878] rounded-lg px-5 py-3">
        <h1 className="flex items-baseline gap-2">
          <i className="bi bi-people-fill text-white text-xl" />
          Players ({players.length})
        </h1>
        <ul className="mt-2 flex flex-col gap-2">
          {players.map((player, index) => (
            <li
              key={index}
              className="w-full bg-[#595959] rounded-lg px-3 py-2"
            >
              {player.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full flex flex-col mt-3 bg-[#343434] border border-[#787878] rounded-lg px-5 py-3">
        <h1 className="flex items-baseline gap-2">
          <i className="bi bi-gear-fill text-white text-xl" />
          Game Settings
        </h1>
        <div className="flex flex-row gap-3 mt-1">
          <div className="grow relative flex items-center">
            <input
              type="text"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none text-xl w-full h-14 p-5 bg-[#595959] rounded-lg peer"
              required
            >
            </input>
            <span className="absolute left-5 text-[#989898] pointer-events-none peer-focus:text-xs peer-focus:-translate-y-[1.15rem] peer-[&:not(:focus):valid]:text-xs peer-[&:not(:focus):valid]:-translate-y-[1.15rem] transition-all">
              Category
            </span>
          </div>
          <div className="grow relative flex items-center">
            <input
              type="number"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none text-xl w-full h-14 p-5 bg-[#595959] rounded-lg peer"
              required
            >
            </input>
            <span className="absolute left-5 text-[#989898] pointer-events-none peer-focus:text-xs peer-focus:-translate-y-[1.15rem] peer-[&:not(:focus):valid]:text-xs peer-[&:not(:focus):valid]:-translate-y-[1.15rem] transition-all">
              Max Players
            </span>
          </div>
        </div>
      </div>
      <button
        className="mx-auto transition-[font-size] w-full min-h-16 mt-3 rounded-lg sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
        disabled
      >
        Start Game
        <i className="bi bi-arrow-right"></i>
      </button>
    </div>
  );
}
