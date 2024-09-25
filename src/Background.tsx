import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector2, type ShaderMaterial } from "three";

interface BackgroundProps {
  redCircleInitPos: Vector2;
  blueCircleInitPos: Vector2;
  tealCircleInitPos: Vector2;
}

export default function Background(props: BackgroundProps) {
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
    fetch("background.frag").then((res) => {
      res.text().then((shader) => setFragmentShader(shader));
    });
    fetch("background.vert").then((res) => {
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
