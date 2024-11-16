import "bootstrap-icons/font/bootstrap-icons.css";

import { Canvas } from "@react-three/fiber";
import { Vector2 } from "three";
import { useEffect, useState } from "react";

import Background from "./Background";
import MainMenu from "./MainMenu";
import PageContext from "./PageContext";

import { socket } from "./socket";
import SignIn from "./SignIn";
import { roomGet, roomJoin } from "./api/room";

declare global {
  interface Window {
    socket: any;
  }
}

export default function App() {
  const [currPage, setPage] = useState<JSX.Element | null>(<SignIn />);

  const [_, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    async function onConnect() {
      setIsConnected(true);

      // TODO: Attempt reconnection
      try {
        const roomCode = await roomGet();
        await roomJoin(roomCode);
        // const gameState = await getGameState();

        // if (gameState === "ended") {
        //   setPage(<Room roomCode={roomCode} />
        // } else {
        //   setPage(<Game roomCode={roomCode} />
        // }
      } catch (error) {
        console.error(error);
        console.error("could not reconnect");
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.connect(); // Connect to the websocket server

    window.socket = socket;

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
        <Canvas className="w-full h-full blur-3xl animate-pulse">
          <Background
            redCircleInitPos={new Vector2(0.15, 0.75)}
            blueCircleInitPos={new Vector2(0.22, 0.27)}
            tealCircleInitPos={new Vector2(0.79, 0.69)}
          />
        </Canvas>
        {currPage}
      </div>
    </PageContext.Provider>
  );
}
