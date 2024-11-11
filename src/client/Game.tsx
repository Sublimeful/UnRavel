import { useContext } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";

export default function Game() {
  const { setPage } = useContext(PageContext);

  return (
    <div className="absolute transition-[width] h-[98%] xl:w-[75%] w-[98%] bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center p-8 text-white overflow-y-scroll overflow-x-clip">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => setPage(<MainMenu />)}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Leave Game
        </button>
        <img src="logo.png" className="w-10 aspect-square" />
      </div>
      <div className="flex flex-row gap-2 text-2xl text-[#28dded] font-semibold">
        <i className="bi bi-clock"></i>2:31
      </div>
      <div className="grow w-full py-5 flex flex-row gap-2">
        <div className="flex-1 bg-[#424242] bg-opacity-70 rounded-lg flex flex-col p-4 gap-4">
          <h1 className="text-2xl flex gap-2 font-semibold">
            <i className="bi bi-people-fill"></i>Players
          </h1>
          <div className="h-12 w-full rounded-lg bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex flex-row items-center px-3 text-xl">
            You
          </div>
          <div className="h-12 w-full rounded-lg bg-[#5e5e5e] flex flex-row items-center px-3 text-xl">
            Player 1
          </div>
          <div className="h-12 w-full rounded-lg bg-[#5e5e5e] flex flex-row items-center px-3 text-xl">
            Player 2
          </div>
        </div>
        <div className="flex-[3] flex flex-col gap-3">
          <div className="flex-[3] bg-[#424242] bg-opacity-70 rounded-lg grid place-items-center text-2xl font-semibold">
            Category: Your Mom
          </div>
          <div className="flex-[8] bg-[#424242] bg-opacity-70 rounded-lg p-5">
            <h1 className="flex gap-2">
              <span className="font-bold">Player 2:</span>Does she have a gyatt?
            </h1>
            <h1 className="flex gap-2 text-[#28dded] ml-3">
              <span className="font-bold">AI:</span>Yes, she has a gyatt.
            </h1>
          </div>
          <form className="flex-1 flex flex-row gap-3">
            <input
              type="text"
              placeholder="Ask a yes/no question..."
              className="flex-[6] focus:outline-none text-base w-full bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] px-3"
              required
            >
            </input>
            <button
              type="submit"
              className="flex-1 mx-auto transition-[font-size] w-full rounded-lg sm:text-base text-black text-sm font-light bg-[#00a0cc] flex items-center justify-center gap-2 disabled:brightness-50"
            >
              Ask
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
          <form className="flex-1 flex flex-row gap-3">
            <input
              type="text"
              placeholder="Make a guess..."
              className="flex-[6] focus:outline-none text-base w-full bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] px-3"
              required
            >
            </input>
            <button
              type="submit"
              className="flex-1 mx-auto transition-[font-size] w-full rounded-lg sm:text-base text-sm font-light bg-gradient-to-r from-[#AC1C1C] to-[#2AAAD9] flex items-center justify-center gap-2 disabled:brightness-50"
            >
              Guess
              <i className="w-5 aspect-square bg-white [mask-size:contain] [mask-image:url(brain.svg)]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
