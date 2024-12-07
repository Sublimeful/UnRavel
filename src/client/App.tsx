import "bootstrap-icons/font/bootstrap-icons.css";

import { useEffect, useState } from "react";

import Background from "./Background";
import PageContext from "./PageContext";

import MainMenu from "./MainMenu";
import SignIn from "./SignIn";
import Room from "./Room";
import Game from "./Game";
import GameOver from "./GameOver";

import { socket } from "./socket";
import { roomGet, roomGetType, roomJoin } from "./api/room";
import { gameGetState } from "./api/game";
import { getSession } from "./api/auth";

export default function App() {
  const [currPage, setPage] = useState<JSX.Element | null>(<></>);

  async function reconnect() {
    try {
      console.log("Attempting Reconnection");

      const roomCode = await roomGet();

      if (!roomCode) {
        const uid = await getSession();

        if (!uid) return false;

        setPage(<MainMenu />);

        return true;
      }

      if (!socket.id) return false;

      await roomJoin(socket.id, roomCode);

      const gameState = await gameGetState(roomCode);
      const roomType = await roomGetType(roomCode);

      if (!gameState || !roomType) return false;

      if (gameState === "idle") {
        if (roomType === "ranked") {
          setPage(<GameOver roomCode={roomCode} />);
        } else {
          setPage(<Room roomCode={roomCode} />);
        }
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

    async function onGameStart() {
      const roomCode = await roomGet();
      // If there is no roomcode, don't do anything
      if (!roomCode) return;
      // Switch to the game page when the game starts
      setPage(<Game roomCode={roomCode} />);
    }

    async function onGameEnd() {
      const roomCode = await roomGet();
      // If there is no roomcode, don't do anything
      if (!roomCode) return;
      // Once the game ends, set the page to game over screen
      setPage(<GameOver roomCode={roomCode} />);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room-game-start", onGameStart);
    socket.on("room-game-end", onGameEnd);

    socket.connect(); // Connect to the websocket server

    return () => {
      // Unregister all event listeners when component is unmounted
      // Otherwise they may trigger in the future unexpectedly
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room-game-start", onGameStart);
      socket.off("room-game-end", onGameEnd);
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
