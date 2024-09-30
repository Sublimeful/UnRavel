import { useContext } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";

export default function JoinARoom() {
  const { setPage } = useContext(PageContext);

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
      <form className="mt-8 flex flex-col gap-8">
        <label className="text-left font-light">
          Room Code
          <input
            type="text"
            placeholder="Enter room code"
            className="text-xl w-full h-14 p-5 bg-[#343434] text-[#787878] rounded-lg border border-[#787878] mt-1"
          ></input>
        </label>
        <label className="text-left font-light">
          Your Name
          <input
            type="text"
            placeholder="Enter your name"
            className="text-xl w-full h-14 p-5 bg-[#343434] text-[#787878] rounded-lg border border-[#787878] mt-1"
          ></input>
        </label>
      </form>
      <button
        className="mx-auto transition-[font-size] w-full min-h-16 mt-8 rounded-lg sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
        disabled
      >
        Join Game
        <i className="bi bi-arrow-right"></i>
      </button>
      <h3 className="text-center mt-12">
        Don’t have a room code?{" "}
        <a href="#" className="text-blue-500">
          Create a new room
        </a>
      </h3>
    </div>
  );
}
