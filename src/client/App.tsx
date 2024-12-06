import "bootstrap-icons/font/bootstrap-icons.css";

import { useEffect, useState } from "react";

import Background from "./Background";
import PageContext from "./PageContext";

import MainMenu from "./MainMenu";
import SignIn from "./SignIn";
import Room from "./Room";
import Game from "./Game";

import { socket } from "./socket";
import { roomGet, roomJoin } from "./api/room";
import { gameGetState } from "./api/game";
import { getSession } from "./api/auth";
import MatchmakingQueue from "./MatchMakingQueue";
import Matchmaking from "./Matchmaking";

export default function App() {
  const [currPage, setPage] = useState<JSX.Element | null>(<></>);

  async function reconnect() {
    try {
      console.log("Attempting Reconnection");

      const roomCode = await roomGet();

      if (!roomCode) {
        const uid = await getSession();

        if (!uid) return false;

        setPage(<Matchmaking />);

        return true;
      }

      if (!socket.id) return false;

      await roomJoin(socket.id, roomCode);
      const gameState = await gameGetState(roomCode);

      if (!gameState) return false;

      if (gameState === "idle") {
        setPage(<Room roomCode={roomCode} />);
      } else {
        setPage(<Game roomCode={roomCode} />);
      }

      return true;
    } catch (error) {
      console.error(error);
      console.error("could not reconnect");

      return false;
    }
  }

  useEffect(() => {
    function onConnect() {
      console.log("Connected");
      // Attempt reconnection
      reconnect().then((success) => {
        if (!success) {
          setPage(<SignIn />);
        }
      });
    }

    function onDisconnect() {
      console.log("Disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.connect(); // Connect to the websocket server

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <PageContext.Provider value={{ currPage, setPage }}>
      <div className="h-screen w-screen bg-[#040039] flex items-center justify-center overflow-y-clip overflow-x-clip">
        <div className="w-full h-full blur-3xl animate-pulse">
          <Background />
        </div>
        {currPage}
      </div>
    </PageContext.Provider>
  );
}
