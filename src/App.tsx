import { Canvas } from "@react-three/fiber";
import { Vector2 } from "three";
import Background from "./Background";
import MainMenu from "./MainMenu";

export default function App() {
  return (
    <div className="h-screen w-screen bg-[#040039] flex items-center justify-center">
      <Canvas className="w-full h-full blur-3xl animate-pulse">
        <Background
          redCircleInitPos={new Vector2(0.15, 0.75)}
          blueCircleInitPos={new Vector2(0.22, 0.27)}
          tealCircleInitPos={new Vector2(0.79, 0.69)}
        />
      </Canvas>
      <MainMenu />
    </div>
  );
}
