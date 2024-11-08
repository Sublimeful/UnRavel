import { type FormEvent, useContext, useRef, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";

import { socket } from "./socket";

export default function CreateARoom() {
  const { setPage } = useContext(PageContext);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");

  function requestRoom(event: FormEvent) {
    event.preventDefault();

    socket.emit("requestRoom", []);
    console.log(socket.id, "requestRoom");

    socket.once("room", () => {
      // TODO: Join room and switch to room page
    });
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
      <form className="mt-8 flex flex-col gap-8" onSubmit={requestRoom}>
        <label className="text-left font-light">
          Your Name
          <input
            ref={usernameInputRef}
            onInput={() => setUsername(usernameInputRef.current!.value)}
            type="text"
            placeholder="Enter your name"
            className="focus:outline-none text-xl w-full h-14 p-5 bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] mt-1"
          >
          </input>
        </label>
        <button
          type="submit"
          className="mx-auto transition-[font-size] w-full min-h-16 mt-8 rounded-lg sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
          disabled={username ? false : true}
        >
          Create Room
          <i className="bi bi-arrow-right"></i>
        </button>
      </form>
    </div>
  );
}
