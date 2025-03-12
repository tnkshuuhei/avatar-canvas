"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Model from "@/components/model";
import { OrbitControls } from "@react-three/drei";

const model = {
  model: "/models/avatar.vrm",
  title: "Test Model",
  desctiption:
    "This is a test model to demonstrate the use of VRM models in a Next.js app.",
};

export default function AvatarCanvas() {
  const gltfCanvasParentRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={gltfCanvasParentRef} style={{ height: 700, width: 600 }}>
      <Canvas
        frameloop="demand"
        camera={{ fov: 20, near: 0.1, far: 300, position: [0, 1, -7] }}
        flat
      >
        <mesh position={[0, -1, 0]}>
          <directionalLight
            intensity={3}
            position={[0, 3, 2]}
            color={"0xFFFFFF"}
          />
          <Model url={model.model} />
          <color attach="background" args={["#f7f7f7"]} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableDamping={false}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
