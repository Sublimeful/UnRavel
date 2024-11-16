import { type FormEvent, useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import {
  roomGetHost,
  roomGetPlayers,
  roomLeave,
  roomStartGame,
} from "./api/room";
import { getPlayer } from "./api/misc";
import { socket } from "./socket";
import type { PlayerID, PlayerSanitized, RoomCode } from "../types";
import Game from "./Game";
import type { GameSettings } from "../types";

interface RoomProps {
  roomCode: RoomCode;
}

export default function Room(props: RoomProps) {
  const { setPage } = useContext(PageContext);
  const { roomCode } = props;

  const [host, setHost] = useState<PlayerID | null>(null);
  const [player, setPlayer] = useState<PlayerSanitized | null>(null);
  const [players, setPlayers] = useState<PlayerSanitized[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    category: "Marvel or DC Superhero",
  });

  const [startButtonDisabled, setStartButtonDisabled] = useState(false);

  async function startGame(event: FormEvent) {
    event.preventDefault();

    if (!socket.id) return;

    setStartButtonDisabled(true);

    try {
      const success = await roomStartGame(
        socket.id,
        roomCode,
        gameSettings,
      );

      if (!success) {
        setStartButtonDisabled(false);
      }
    } catch (_) {
      setStartButtonDisabled(false);
    }
  }

  useEffect(() => {
    function updatePlayerList() {
      if (!socket.id) return;
      roomGetHost(socket.id, roomCode).then((_host) => {
        if (_host) setHost(_host);
      });
      getPlayer(socket.id).then((_player) => {
        if (_player) setPlayer(_player);
      });
      roomGetPlayers(socket.id, roomCode).then((_players) => {
        if (_players) setPlayers(_players);
      });
    }

    function onceGameStarts() {
      // Switch to the game page when the game starts again
      setPage(<Game roomCode={roomCode} />);
    }

    // Switch to the game page when the game starts
    socket.once("room-game-start", onceGameStarts);
    socket.on("room-player-joined", updatePlayerList);
    socket.on("room-player-left", updatePlayerList);

    updatePlayerList(); // Initially update the player list

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("room-game-start", onceGameStarts);
      socket.off("room-player-joined", updatePlayerList);
      socket.off("room-player-left", updatePlayerList);
    };
  }, []);

  return (
    <div className="absolute transition-[width] h-[98%] lg:w-[50%] w-[98%] bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center p-10 text-white overflow-y-scroll overflow-x-clip">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={async () => {
            // Back button pressed leaves room
            if (!socket.id) return;
            const success = await roomLeave(socket.id, roomCode);
            if (!success) return;
            setPage(<MainMenu />);
          }}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Leave Room
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
          {players.sort((a, b) => {
            if (player && (player.id === a.id || player.id === b.id)) {
              return (b.id === player.id) ? 1 : -1;
            } else {
              return a.username.localeCompare(b.username);
            }
          }).map((_player) => (
            <li
              key={_player.id}
              className="flex flex-row justify-between w-full bg-[#595959] rounded-lg px-3 py-2"
            >
              <h1 className="w-full text-xl text-nowrap break-all truncate">
                {_player.username}
              </h1>
              {host && host === _player.id && (
                <div className="bg-red-500 rounded-lg self-end w-14 grid place-items-center">
                  Host
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {host && player && host === player.id && (
        <form
          className="w-full"
          onSubmit={startGame}
        >
          <div className="w-full flex flex-col mt-3 bg-[#343434] border border-[#787878] rounded-lg px-5 py-3">
            <h1 className="flex items-baseline gap-2">
              <i className="bi bi-gear-fill text-white text-xl" />
              Game Settings
            </h1>
            <div className="flex flex-row gap-3 mt-1">
              <div className="flex-[1_0_0] relative flex items-center">
                <input
                  onInput={(event) =>
                    setGameSettings({
                      ...gameSettings,
                      category: event.currentTarget.value,
                    })}
                  type="text"
                  defaultValue={gameSettings.category}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none text-xl w-full h-14 p-5 bg-[#595959] rounded-lg peer"
                  required
                >
                </input>
                <span className="absolute left-5 text-[#989898] pointer-events-none peer-focus:text-xs peer-focus:-translate-y-[1.1rem] peer-[&:not(:focus):valid]:text-xs peer-[&:not(:focus):valid]:-translate-y-[1.1rem] transition-all">
                  Category
                </span>
              </div>
              <div className="flex-[1_0_0] relative flex items-center">
                <input
                  type="number"
                  defaultValue={4}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none text-xl w-full h-14 p-5 bg-[#595959] rounded-lg peer"
                  required
                >
                </input>
                <span className="absolute left-5 text-[#989898] pointer-events-none peer-focus:text-xs peer-focus:-translate-y-[1.1rem] peer-[&:not(:focus):valid]:text-xs peer-[&:not(:focus):valid]:-translate-y-[1.1rem] transition-all">
                  Max Players
                </span>
              </div>
            </div>
          </div>
          <button
            className="mx-auto transition-[font-size] w-full min-h-16 mt-3 rounded-lg sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
            disabled={startButtonDisabled}
          >
            Start Game
            <i className="bi bi-arrow-right"></i>
          </button>
        </form>
      )}
    </div>
  );
}
