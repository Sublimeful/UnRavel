import { type FormEvent, useContext, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import CreateARoom from "./CreateARoom";
import type { RoomCode } from "../types";
import { roomJoin as apiRoomJoin } from "./api/room";
import { playerSignIn } from "./api/misc";
import { socket } from "./socket";
import Room from "./Room";

export default function JoinARoom() {
  const { setPage } = useContext(PageContext);

  const [roomCode, setRoomCode] = useState<RoomCode>("");
  const [username, setUsername] = useState<string>("");

  const [disableBtn, setDisableBtn] = useState(false);

  async function roomJoin(event: FormEvent) {
    event.preventDefault();

    if (!socket.id || !roomCode || !username) return;

    setDisableBtn(true); // Disable button spamming

    try {
      await playerSignIn(socket.id, username);

      const roomExists = await apiRoomJoin(socket.id, roomCode);

      // If the room does not exist, then you can't join it
      if (roomExists) {
        setPage(<Room roomCode={roomCode} />);
      } else {
        setDisableBtn(false);
      }
    } catch (_) {
      setDisableBtn(false);
    }
  }

  return (
    <div className="absolute transition-[height,width] lg:h-[90%] h-[98%] md:w-3/4 w-[98%] max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-1">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => setPage(<MainMenu />)}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Back to Menu
        </button>
        <img src="logo.png" className="w-24 aspect-square" />
      </div>
      <h1 className="text-center text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#55CED2] to-[#DB1F3C]">
        Join a Room
      </h1>
      <form className="mt-8 flex flex-col gap-8" onSubmit={roomJoin}>
        <label className="text-left font-light relative">
          Room Code
          <input
            onInput={(event) => setRoomCode(event.currentTarget.value)}
            type="text"
            placeholder="Enter room code"
            className="focus:outline-none text-xl w-full h-14 p-5 bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] mt-1"
            required
          >
          </input>
          <i className="bi bi-people-fill text-[#7d7d7d] text-xl absolute right-5 top-11">
          </i>
        </label>
        <label className="text-left font-light">
          Your Name
          <input
            onInput={(event) => setUsername(event.currentTarget.value)}
            type="text"
            placeholder="Enter your name"
            className="focus:outline-none text-xl w-full h-14 p-5 bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] mt-1"
            required
          >
          </input>
        </label>
        <button
          className="mx-auto transition-[font-size] w-full min-h-16 mt-8 rounded-lg sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
          disabled={disableBtn || !roomCode || !username}
        >
          Join Game
          <i className="bi bi-arrow-right"></i>
        </button>
      </form>
      <h3 className="text-center mt-12">
        Don’t have a room code?{" "}
        <a
          onClick={() => setPage(<CreateARoom />)}
          href="#"
          className="text-blue-500"
        >
          Create a new room
        </a>
      </h3>
    </div>
  );
}
