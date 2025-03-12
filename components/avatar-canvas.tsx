"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Model from "@/components/model";
import { OrbitControls } from "@react-three/drei";

export default function AvatarCanvas({ model }: { model: string }) {
  const gltfCanvasParentRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={gltfCanvasParentRef} style={{ height: 700, width: 600 }}>
      <Canvas
        frameloop="always"
        camera={{ fov: 20, near: 0.1, far: 300, position: [0, 1, -4] }}
        flat
      >
        <mesh position={[0, -1, 0]}>
          <directionalLight
            intensity={3}
            position={[0, 3, 2]}
            color={"0xFFFFFF"}
          />
          <Model url={model} />
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
