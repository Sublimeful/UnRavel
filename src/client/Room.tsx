import { type FormEvent, useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import {
  roomGetHost,
  roomGetMaxPlayers,
  roomGetPlayers,
  roomLeave,
  roomStartGame,
} from "./api/room";
import { getPlayer } from "./api/player";
import { socket } from "./socket";
import type { PlayerSanitized } from "../types";
import type { GameSettings } from "../types";
import randomCategories from "../RandomCategories.json" with { type: "json" };

interface RoomProps {
  roomCode: string;
}

export default function Room(props: RoomProps) {
  const { setPage } = useContext(PageContext);
  const { roomCode } = props;

  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [host, setHost] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerSanitized | null>(null);
  const [players, setPlayers] = useState<PlayerSanitized[]>([]);
  const [disableStartGameBtn, setDisableStartGameBtn] = useState(false);
  const [disableRoomLeaveBtn, setDisableRoomLeaveBtn] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    category: getRandomCategory(),
    timeLimit: 60 * 2, // 2 minutes
  });

  function getRandomCategory() {
    return randomCategories[
      Math.floor(Math.random() * randomCategories.length)
    ];
  }

  async function startGame(event: FormEvent) {
    event.preventDefault();

    setDisableStartGameBtn(true); // Prevent button spamming

    try {
      const success = await roomStartGame(roomCode, gameSettings);

      if (!success) {
        setDisableStartGameBtn(false);
      }
    } catch (_) {
      setDisableStartGameBtn(false);
    }
  }

  useEffect(() => {
    function updateMaxPlayers() {
      roomGetMaxPlayers(roomCode).then(setMaxPlayers);
    }

    function updatePlayerList() {
      roomGetHost(roomCode).then(setHost);
      getPlayer().then(setPlayer);
      roomGetPlayers(roomCode).then((_players) => {
        if (_players) setPlayers(_players);
      });
    }

    socket.on("room-player-left", updatePlayerList);
    socket.on("room-player-joined", updatePlayerList);

    updateMaxPlayers(); // Initially update max players
    updatePlayerList(); // Initially update the player list

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("room-player-left", updatePlayerList);
      socket.off("room-player-joined", updatePlayerList);
    };
  }, []);

  return (
    <div className="absolute transition-[width] h-[98%] lg:w-[50%] w-[98%] bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center p-10 text-white overflow-y-scroll overflow-x-clip">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={async () => {
            if (!socket.id) return;
            setDisableRoomLeaveBtn(true); // Prevent button spamming
            // If player successfully leaves the room, set page to main menu
            if (await roomLeave(socket.id, roomCode)) {
              setPage(<MainMenu />);
            } else {
              setDisableRoomLeaveBtn(false);
            }
          }}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
          disabled={disableRoomLeaveBtn}
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
          Players ({players.length}/{maxPlayers ?? "?"})
        </h1>
        <ul className="mt-2 flex flex-col gap-2">
          {players
            .sort((a, b) => {
              if (player && (player.uid === a.uid || player.uid === b.uid)) {
                return b.uid === player.uid ? 1 : -1;
              } else {
                return a.username.localeCompare(b.username);
              }
            })
            .map((_player) => (
              <li
                key={_player.uid}
                className="flex flex-row justify-between w-full bg-[#595959] rounded-lg px-3 py-2"
              >
                <h1 className="w-full text-xl text-nowrap break-all truncate">
                  {_player.username}
                </h1>
                {host && host === _player.uid && (
                  <div className="bg-red-500 rounded-lg self-end w-14 grid place-items-center">
                    Host
                  </div>
                )}
              </li>
            ))}
        </ul>
      </div>
      {host && player && host === player.uid && (
        <form className="w-full" onSubmit={startGame}>
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
                      timeLimit: parseInt(event.currentTarget.value),
                    })}
                  type="number"
                  defaultValue={gameSettings.timeLimit}
                  min={10}
                  max={3600}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none text-xl w-full h-14 p-5 pr-16 bg-[#595959] rounded-lg peer mt-1"
                  required
                >
                </input>
                <span className="absolute left-5 text-[#989898] pointer-events-none peer-focus:text-xs peer-focus:-translate-y-[1.1rem] peer-[&:not(:focus):valid]:text-xs peer-[&:not(:focus):valid]:-translate-y-[1.1rem] transition-all">
                  Time Limit (seconds)
                </span>
              </div>
            </div>
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none text-xl w-full h-14 p-5 pr-16 bg-[#595959] rounded-lg peer mt-1"
                  required
                >
                </input>
                <span className="absolute left-5 text-[#989898] pointer-events-none peer-focus:text-xs peer-focus:-translate-y-[1.1rem] peer-[&:not(:focus):valid]:text-xs peer-[&:not(:focus):valid]:-translate-y-[1.1rem] transition-all">
                  Category
                </span>
                <i
                  onClick={(event) => {
                    const randomCategory = getRandomCategory();

                    setGameSettings({
                      ...gameSettings,
                      category: randomCategory,
                    });

                    if (event.currentTarget.parentElement) {
                      const parent = event.currentTarget.parentElement;
                      const categoryInput = parent.querySelector("input");
                      if (categoryInput) {
                        categoryInput.value = randomCategory;
                      }
                    }
                  }}
                  className="bi bi-dice-6-fill text-white text-2xl absolute right-5 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <button
            className="mx-auto transition-[font-size] w-full min-h-16 mt-3 rounded-lg sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
            disabled={disableStartGameBtn}
          >
            Start Game
            <i className="bi bi-arrow-right"></i>
          </button>
        </form>
      )}
    </div>
  );
}
