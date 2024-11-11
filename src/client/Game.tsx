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
        <div className="flex-1 bg-[#424242] bg-opacity-70 rounded-lg"></div>
        <div className="flex-[3] flex flex-col gap-3">
          <div className="flex-[3] bg-[#424242] bg-opacity-70 rounded-lg grid place-items-center text-2xl font-semibold">Category: Your Mom</div>
          <div className="flex-[8] bg-[#424242] bg-opacity-70 rounded-lg"></div>
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
