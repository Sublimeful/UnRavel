import { useContext } from "react";

import HowToPlay from "./HowToPlay";
import PageContext from "./PageContext";
import JoinARoom from "./JoinARoom";

export default function MainMenu() {
  const { setPage } = useContext(PageContext);

  return (
    <div className="absolute transition-[height,width] lg:h-[90%] h-[98%] md:w-3/4 w-[98%] max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-1">
      <div className="w-full flex justify-center">
        <img src="logo.png" className="w-40 aspect-square" />
      </div>
      <h1 className="text-center text-[#DB1F3C] text-5xl font-bold">UnRavel</h1>
      <h2 className="text-center text-3xl font-light">
        The Ultimate Guessing Game
      </h2>
      <button
        onClick={() => setPage(<JoinARoom />)}
        className="mx-auto transition-[width,font-size] sm:w-3/4 w-full min-h-16 mt-8 rounded sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#003089] flex items-center justify-center gap-2"
      >
        Join a Random Room
        <i className="bi bi-shuffle"></i>
      </button>
      <div className="mx-auto transition-[width] sm:w-3/4 w-full mt-5 flex flex-row gap-2">
        <button className="w-1/2 min-h-16 rounded transition-[font-size] sm:text-lg text-sm font-light bg-[#595858] flex items-center justify-center gap-2">
          Create a Room
          <i className="bi bi-plus-square"></i>
        </button>
        <button className="w-1/2 min-h-16 rounded transition-[font-size] sm:text-lg text-sm font-light bg-[#595858] flex items-center justify-center gap-2">
          Join a Room
          <i className="bi bi-people-fill"></i>
        </button>
      </div>
      <button
        onClick={() => setPage(<HowToPlay />)}
        className="mx-auto transition-[width,font-size] sm:w-3/4 w-full min-h-16 mt-5 rounded sm:text-2xl text-xl font-light bg-[#595858] flex items-center justify-center gap-2"
      >
        How to Play
        <i className="bi bi-question-circle"></i>
      </button>
    </div>
  );
}
