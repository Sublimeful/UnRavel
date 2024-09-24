import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector2, type ShaderMaterial } from "three";

interface BackgroundProps {
  redCircleInitPos: Vector2;
  blueCircleInitPos: Vector2;
  tealCircleInitPos: Vector2;
}

function Background(props: BackgroundProps) {
  const { redCircleInitPos, blueCircleInitPos, tealCircleInitPos } = props;
  const [fragmentShader, setFragmentShader] = useState("");
  const [vertexShader, setVertexShader] = useState("");
  const [pointer, setPointer] = useState<Vector2>();
  const { viewport } = useThree();

  const circleInitPos = useRef<Vector2[]>([
    redCircleInitPos,
    blueCircleInitPos,
    tealCircleInitPos,
  ]);
  const circlePos = useRef<Vector2[]>([
    redCircleInitPos.clone(),
    blueCircleInitPos.clone(),
    tealCircleInitPos.clone(),
  ]);

  const shaderMaterialRef = useRef<ShaderMaterial>(null);

  useEffect(() => {
    // Component is mounted
    fetch("/background.frag").then((res) => {
      res.text().then((shader) => setFragmentShader(shader));
    });
    fetch("/background.vert").then((res) => {
      res.text().then((shader) => setVertexShader(shader));
    });
    // Track mouse movement
    window.addEventListener("mousemove", (ev) => {
      setPointer(
        new Vector2(ev.x / window.innerWidth, 1 - ev.y / window.innerHeight),
      );
    });
  }, []);

  useEffect(() => {
    if (!shaderMaterialRef.current) return;
    shaderMaterialRef.current.uniforms["u_aspect"].value = viewport.aspect;
  }, [viewport.aspect]);

  useFrame((_, delta) => {
    if (pointer && shaderMaterialRef.current) {
      for (let i = 0; i < circlePos.current.length; i++) {
        const deltaPos = pointer
          .clone()
          .sub(circleInitPos.current[i])
          .setLength(0.05)
          .add(circleInitPos.current[i])
          .sub(circlePos.current[i])
          .multiplyScalar(delta);
        circlePos.current[i].add(deltaPos);
      }
    }
  });

  const uniforms = useMemo(
    () => ({
      u_aspect: {
        value: viewport.aspect,
      },
      u_redCirclePos: {
        value: circlePos.current[0],
      },
      u_blueCirclePos: {
        value: circlePos.current[1],
      },
      u_tealCirclePos: {
        value: circlePos.current[2],
      },
    }),
    [],
  );

  if (fragmentShader === "" || vertexShader === "") {
    return null;
  } else {
    return (
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <shaderMaterial
          ref={shaderMaterialRef}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </mesh>
    );
  }
}

export default function App() {
  return (
    <div className="h-screen w-screen bg-[#040039] flex items-center justify-center">
      <Canvas className="canvasBG w-full h-full blur-3xl animate-pulse">
        <Background
          redCircleInitPos={new Vector2(0.15, 0.75)}
          blueCircleInitPos={new Vector2(0.22, 0.27)}
          tealCircleInitPos={new Vector2(0.79, 0.69)}
        />
      </Canvas>
      <div className="absolute h-5/6 w-3/4 max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col items-center justify-center text-white">
        <img src="/logo.png" className="w-40 aspect-square" />
        <h1 className="text-[#DB1F3C] text-5xl font-bold">UnRavel</h1>
        <h2 className="text-3xl font-light">The Ultimate Guessing Game</h2>
        <button className="w-3/4 h-16 mt-10 rounded text-2xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#003089] flex items-center justify-center gap-2">
          Join a Random Room
          <span className="h-8 aspect-square bg-contain bg-no-repeat bg-[url('/shuffle.svg')]" />
        </button>
        <div className="w-3/4 mt-6 flex flex-row gap-2">
          <button className="w-1/2 h-16 rounded text-lg font-light bg-[#595858] flex items-center justify-center gap-2">
            Create a Room
            <span className="h-5 aspect-square bg-contain bg-no-repeat bg-[url('/plus-square.svg')]" />
          </button>
          <button className="w-1/2 h-16 rounded text-lg font-light bg-[#595858] flex items-center justify-center gap-2">
            Join a Room
            <span className="h-5 aspect-square bg-contain bg-no-repeat bg-[url('/people-fill.svg')]" />
          </button>
        </div>
        <button className="w-3/4 h-16 mt-6 rounded text-2xl font-light bg-[#595858] flex items-center justify-center gap-2">
          How to Play
          <span className="h-8 aspect-square bg-contain bg-no-repeat bg-[url('/question-circle.svg')]" />
        </button>
      </div>
    </div>
  );
}
