import "bootstrap-icons/font/bootstrap-icons.css";

import { Canvas } from "@react-three/fiber";
import { Vector2 } from "three";
import { useEffect, useState } from "react";

import Background from "./Background";
// import MainMenu from "./MainMenu";
import Room from "./Room";
import PageContext from "./PageContext";

import { socket } from "./socket";

export default function App() {
  // const [currPage, setPage] = useState<JSX.Element | null>(<MainMenu />);
  const [currPage, setPage] = useState<JSX.Element | null>(<Room roomCode="Test" />);

  const [_, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      console.log(socket.id, "connect");
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.connect(); // Connect to the websocket server

    return () => {
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
