import { type FormEvent, useContext, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";

import { socket } from "./socket";
import { roomRequest as apiRoomRequest } from "./api/room";
import { playerSignIn } from "./api/player";
import Room from "./Room";

export default function CreateARoom() {
  const { setPage } = useContext(PageContext);
  const [username, setUsername] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [disableCreateRoomBtn, setDisableCreateRoomBtn] = useState(false);

  async function roomRequest(event: FormEvent) {
    event.preventDefault();

    if (!socket.id || !username || !maxPlayers) return;

    setDisableCreateRoomBtn(true); // Prevent button spamming

    try {
      await playerSignIn(username);

      const roomCode = await apiRoomRequest(socket.id, maxPlayers);

      if (!roomCode) return;

      setPage(<Room roomCode={roomCode} />);
    } catch (_) {
      setDisableCreateRoomBtn(false);
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
        Create a Room
      </h1>
      <form className="mt-8 flex flex-col gap-8" onSubmit={roomRequest}>
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
        <label className="text-left font-light">
          Max Players
          <input
            onInput={(event) =>
              setMaxPlayers(parseInt(event.currentTarget.value))}
            type="number"
            defaultValue={maxPlayers}
            min={1}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none text-xl w-full h-14 p-5 bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] mt-1"
            required
          >
          </input>
        </label>
        <button
          type="submit"
          className="mx-auto transition-[font-size] w-full min-h-16 mt-8 rounded-lg sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
          disabled={disableCreateRoomBtn || !username || !maxPlayers}
        >
          Create Room
          <i className="bi bi-arrow-right"></i>
        </button>
      </form>
    </div>
  );
}
