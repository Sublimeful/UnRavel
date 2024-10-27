import "bootstrap-icons/font/bootstrap-icons.css";

import { Canvas } from "@react-three/fiber";
import { Vector2 } from "three";
import { useState } from "react";

import Background from "./Background";
import MainMenu from "./MainMenu";
import PageContext from "./PageContext";

export default function App() {
  const [currPage, setPage] = useState<JSX.Element | null>(<MainMenu />);

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
