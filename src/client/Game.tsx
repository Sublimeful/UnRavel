import { useContext, useEffect, useState } from "react";

import PageContext from "./PageContext";
import MainMenu from "./MainMenu";
import { gameGetTimeLeft, roomLeave } from "./api";
import { socket } from "./socket";
import type { RoomCode } from "../types";

interface GameProps {
  roomCode: RoomCode;
}

export default function Game(props: GameProps) {
  const { roomCode } = props;
  const { setPage } = useContext(PageContext);

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    function syncTimeLeft() {
      if (!socket.id) return;

      gameGetTimeLeft(socket.id, roomCode).then((_timeLeft) => {
        if (!_timeLeft) return;
        setTimeLeft(_timeLeft);
      });
    }

    // Sync time left initially
    syncTimeLeft();

    // Every 5 seconds, sync time left
    const syncTimeLeftInterval = setInterval(syncTimeLeft, 5000);

    return () => clearInterval(syncTimeLeftInterval);
  }, []);

  // Update the timer every second
  useEffect(() => {
    const timerTimeout = setTimeout(() => {
      if (timeLeft >= 1000) {
        setTimeLeft(timeLeft - 1000);
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearTimeout(timerTimeout);
  }, [timeLeft]);

  function timerFormat(timeLeft: number) {
    const secondInMS = 1000;
    const minuteInMS = secondInMS * 60;
    const hourInMS = minuteInMS * 60;
    const HH = Math.floor(timeLeft / hourInMS);
    const MM = Math.floor((timeLeft % hourInMS) / minuteInMS);
    const SS = Math.floor((timeLeft % minuteInMS) / secondInMS);
    if (timeLeft >= 1000 * 60 * 60) {
      return `${HH}:${MM.toString().padStart(2, "0")}:${
        SS.toString().padStart(2, "0")
      }`;
    } else if (timeLeft >= 1000 * 60) {
      return `${MM}:${SS.toString().padStart(2, "0")}`;
    } else {
      return `${SS}`;
    }
  }

  return (
    <div className="absolute transition-[width] h-[98%] xl:w-[75%] w-[98%] bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center p-8 text-white overflow-y-scroll overflow-x-clip">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={() => {
            if (socket.id) roomLeave(socket.id, roomCode); // Back button pressed leaves game/room
            setPage(<MainMenu />);
          }}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
        >
          <i className="bi bi-arrow-left"></i>Leave Game
        </button>
        <img src="logo.png" className="w-10 aspect-square" />
      </div>
      <div className="flex flex-row gap-2 text-2xl text-[#28dded] font-semibold">
        <i className="bi bi-clock"></i>
        {timerFormat(timeLeft)}
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
