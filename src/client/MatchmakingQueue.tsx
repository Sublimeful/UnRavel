import { useContext, useEffect, useState } from "react";
import PageContext from "./PageContext";
import Matchmaking from "./Matchmaking";
import {
  matchmakingQueueEnter as apiMatchmakingQueueEnter,
  matchmakingQueueLeave as apiMatchmakingQueueLeave,
} from "./api/matchmaking";
import { socket } from "./socket";
import Game from "./Game";

export default function MatchmakingQueue() {
  const { setPage } = useContext(PageContext);
  const [disableMatchmakingQueueLeaveBtn, setDisableMatchmakingQueueLeaveBtn] =
    useState(false);

  async function matchmakingQueueEnter() {
    if (!socket.id) return;
    apiMatchmakingQueueEnter(socket.id);
  }

  async function matchmakingQueueLeave() {
    setDisableMatchmakingQueueLeaveBtn(true); // Prevent button spamming
    if (await apiMatchmakingQueueLeave()) {
      setPage(<Matchmaking />);
    } else {
      setDisableMatchmakingQueueLeaveBtn(false);
    }
  }

  useEffect(() => {
    // Place user in queue
    matchmakingQueueEnter();

    function onceGameStarts(roomCode: string) {
      // Switch to the game page when the game starts again
      setPage(<Game roomCode={roomCode} />);
    }

    // Socket IO event fires when we find a match
    socket.once("room-game-start", onceGameStarts);

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("room-game-start", onceGameStarts);
    };
  });

  return (
    <div className="absolute transition-[height,width] lg:h-[90%] h-[98%] md:w-3/4 w-[98%] max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-1">
      <div className="flex flex-row w-full justify-between">
        <button
          onClick={matchmakingQueueLeave}
          className="self-start text-lg font-light flex items-center justify-center gap-2"
          disabled={disableMatchmakingQueueLeaveBtn}
        >
          <i className="bi bi-arrow-left"></i>Leave Queue
        </button>
        <img src="logo.png" className="w-24 aspect-square" />
      </div>
      <h1 className="text-center text-5xl leading-normal font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#55CED2] to-[#DB1F3C]">
        Finding match
      </h1>
      <div className="grid place-items-center mt-16">
        <div
          className="aspect-square"
          style={{
            "border": "16px solid #4b5563", /* Grey */
            "borderTop": "16px solid #3498db", /* Blue */
            "borderRadius": "50%",
            "width": "10rem",
            "animation": "spin 2s linear infinite",
          }}
        >
        </div>
      </div>
    </div>
  );
}
