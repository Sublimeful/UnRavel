import { type FormEvent, useContext, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import CreateARoom from "./CreateARoom";
import Room from "./Room";
import Game from "./Game";

import { socket } from "./socket";
import { roomJoin as apiRoomJoin } from "./api/room";
import { playerSignIn } from "./api/player";
import { gameGetState } from "./api/game";

export default function JoinARoom() {
  const { setPage } = useContext(PageContext);

  const [roomCode, setRoomCode] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const [disableJoinRoomBtn, setDisableJoinRoomBtn] = useState(false);

  async function roomJoin(event: FormEvent) {
    event.preventDefault();

    if (!socket.id || !roomCode || !username) return;

    setDisableJoinRoomBtn(true); // Prevent button spamming

    try {
      await playerSignIn(username);

      const roomExists = await apiRoomJoin(socket.id, roomCode);

      // If the room does not exist, then you can't join it
      if (roomExists) {
        const gameState = await gameGetState(roomCode);

        if (!gameState) return;

        if (gameState === "idle") {
          setPage(<Room roomCode={roomCode} />);
        } else {
          setPage(<Game roomCode={roomCode} />);
        }
      } else {
        setDisableJoinRoomBtn(false);
      }
    } catch (_) {
      setDisableJoinRoomBtn(false);
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
          disabled={disableJoinRoomBtn || !roomCode || !username}
        >
          Join Room
          <i className="bi bi-arrow-right"></i>
        </button>
      </form>
      <h3 className="text-center mt-12">
        Don’t have a room code?{" "}
        <a
          onClick={() => setPage(<CreateARoom />)}
          className="cursor-pointer text-blue-500"
        >
          Create a new room
        </a>
      </h3>
    </div>
  );
}
