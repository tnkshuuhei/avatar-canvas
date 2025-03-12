"use client";

import * as THREE from "three";
import { FC, useState, useEffect, useRef } from "react";
import { Html } from "@react-three/drei";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  VRMLoaderPlugin,
  VRM,
  VRMExpressionPresetName,
} from "@pixiv/three-vrm";
import { useFrame } from "@react-three/fiber";

interface ModelProps {
  url: string;
}

// Lip-sync configuration
interface LipSyncState {
  active: boolean;
  text: string;
  elapsedTime: number;
  currentIndex: number;
  mouthOpenness: number;
  lastUpdateTime: number;
  syllableDuration: number;
}

// Function to reset and position the arms
const positionArms = (vrm: VRM) => {
  if (!vrm.humanoid) return;

  // Position right arm
  const rightUpperArm = vrm.humanoid.getRawBoneNode("rightUpperArm");
  const rightLowerArm = vrm.humanoid.getRawBoneNode("rightLowerArm");
  if (rightUpperArm && rightLowerArm) {
    // Right arm rotation parameters
    rightUpperArm.rotation.z = -1.2; // Negative value moves arm down/inward
    rightUpperArm.rotation.x = 0.1; // Slight forward tilt
    rightLowerArm.rotation.x = 0.1; // Slight elbow bend
  }

  // Position left arm
  const leftUpperArm = vrm.humanoid.getRawBoneNode("leftUpperArm");
  const leftLowerArm = vrm.humanoid.getRawBoneNode("leftLowerArm");
  if (leftUpperArm && leftLowerArm) {
    // Left arm rotation parameters (mirrored values)
    leftUpperArm.rotation.z = 1.2; // Positive value moves arm down/inward
    leftUpperArm.rotation.x = 0.1; // Slight forward tilt
    leftLowerArm.rotation.x = 0.5; // Slight elbow bend
  }
};

const Model: FC<ModelProps> = ({ url }: ModelProps) => {
  const [gltf, setGltf] = useState<GLTF>();
  const [progress, setProgress] = useState<number>(0);
  const vrmRef = useRef<VRM | null>(null);
  const lipSyncRef = useRef<LipSyncState>({
    active: false,
    text: "",
    elapsedTime: 0,
    currentIndex: 0,
    mouthOpenness: 0,
    lastUpdateTime: 0,
    syllableDuration: 0.15, // Average duration for a syllable in seconds
  });

  const sizes = {
    width: innerWidth,
    height: innerHeight,
  };

  // Load the VRM model
  useEffect(() => {
    // Initialize the renderer
    // - antialias: true (smoother edges)
    // - alpha: true (transparent background)
    // - preserveDrawingBuffer: true (allows saving canvas as image)
    // - precision: "highp" (high precision for shaders)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      precision: "highp",
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, -2);
    camera.lookAt(0, 1.2, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7);

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      // update time(If you increase the value, the movement will be faster)
      time += 0.01;

      // handle VRM model animation
      if (vrmRef.current) {
        const vrm = vrmRef.current;

        // standing motion
        // - base position: -0.2
        // - oscillation speed: time * 5 (higher value makes it oscillate faster)
        // - oscillation width: 0.005 (higher value makes it oscillate wider)
        vrm.scene.position.y = -0.2 + Math.sin(time * 5) * 0.005;

        // body rotation (side-to-side swaying)
        // - oscillation speed: time * 0.5 (higher value makes it sway faster)
        // - oscillation width: 0.01 (higher value makes it sway wider)
        vrm.scene.rotation.y = Math.sin(time * 0.5) * 0.01;

        // blinking process
        // - occurrence probability: 0.005 (higher value makes blinking more frequent)
        // - blink duration: setTimeout 50ms (duration of closed eyelids)
        if (vrm.expressionManager && Math.random() < 0.005) {
          const blink = async () => {
            // close eyelids
            vrm.expressionManager?.setValue("blinkLeft", 1.0);
            vrm.expressionManager?.setValue("blinkRight", 1.0);
            vrm.expressionManager?.update();

            await new Promise((resolve) => setTimeout(resolve, 50));

            // open eyelids (gradual opening process)
            // - opening speed: decreasing by 0.1 every 5ms
            for (let i = 1.0; i >= 0; i -= 0.1) {
              vrm.expressionManager?.setValue("blinkLeft", i);
              vrm.expressionManager?.setValue("blinkRight", i);
              vrm.expressionManager?.update();
              await new Promise((resolve) => setTimeout(resolve, 5));
            }
          };
          blink();
        }
      }

      renderer.render(scene, camera);
    };

    if (!gltf) {
      const loader = new GLTFLoader();
      loader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });

      const vrm = vrmRef.current;
      console.log("vrm: ", vrm);

      loader.load(
        url,
        (tmpGltf) => {
          setGltf(tmpGltf);
          // Store VRM instance
          vrmRef.current = tmpGltf.userData.vrm;
          console.log("VRM loaded:", vrmRef.current);
        },
        // called as loading progresses
        (xhr) => {
          setProgress((xhr.loaded / xhr.total) * 100);
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        // called when loading has errors
        (error) => {
          console.log("An error happened");
          console.log(error);
        }
      );
    } else {
      const vrm = vrmRef.current;

      if (vrm?.humanoid) {
        animate();
        positionArms(vrm);
      }
    }
  }, [gltf, url]);

  // Listen for lip-sync and speech events
  useEffect(() => {
    const handleLipSync = (event: CustomEvent) => {
      const { active, text } = event.detail;

      console.log("Lip-sync event received:", active, text);

      // Only update state if it's a state change
      if (lipSyncRef.current.active !== active) {
        lipSyncRef.current = {
          ...lipSyncRef.current,
          active,
          text: text || "",
          elapsedTime: 0,
          currentIndex: 0,
          lastUpdateTime: Date.now() / 1000,
        };
      }
    };

    // Handle speech start event
    const handleSpeechStart = () => {
      console.log("Speech started");
      lipSyncRef.current.active = true;
    };

    // Handle speech end event
    const handleSpeechEnd = () => {
      console.log("Speech ended");
      lipSyncRef.current.active = false;
    };

    // Add event listeners
    window.addEventListener("lipSync", handleLipSync as EventListener);
    window.addEventListener("speechStart", handleSpeechStart as EventListener);
    window.addEventListener("speechEnd", handleSpeechEnd as EventListener);

    // Clean up
    return () => {
      window.removeEventListener("lipSync", handleLipSync as EventListener);
      window.removeEventListener(
        "speechStart",
        handleSpeechStart as EventListener
      );
      window.removeEventListener("speechEnd", handleSpeechEnd as EventListener);
    };
  }, []);

  // Animation loop for lip-sync
  useFrame((_, delta) => {
    if (!vrmRef.current) return;

    const lipSync = lipSyncRef.current;
    const vrm = vrmRef.current;

    if (lipSync.active) {
      // Update elapsed time
      lipSync.elapsedTime += delta;

      // Improved mouth animation with varying speeds and patterns

      // Calculate time per syllable based on text length
      // const totalSyllables = estimateSyllables(lipSync.text);

      // Use a more irregular pattern to mimic natural speech
      // Adding noise makes speech look more natural
      const now = Date.now() / 1000;
      const fastNoise = Math.sin(now * 10) * 0.1; // Fast subtle variations
      const slowNoise = Math.sin(now * 3) * 0.1; // Slower variations

      // Create a more natural rhythm
      const baseSpeed = 5.0; // Speed of mouth movement
      const time = lipSync.elapsedTime * baseSpeed;

      // Combine several sine waves of different frequencies for natural movement
      const wave1 = Math.sin(time * 1.0) * 0.5;
      const wave2 = Math.sin(time * 1.5) * 0.3;
      const wave3 = Math.sin(time * 2.1) * 0.2;

      // Combine waves and ensure values are positive
      lipSync.mouthOpenness = Math.max(
        0,
        (wave1 + wave2 + wave3) * 0.7 + fastNoise + slowNoise
      );

      // Apply to VRM blendshapes
      // Use multiple expressions for more realistic mouth movements
      if (vrm.expressionManager) {
        // Main "Ah" expression for opening the mouth
        vrm.expressionManager.setValue(
          VRMExpressionPresetName.Aa,
          lipSync.mouthOpenness
        );

        // Subtle "Ih" expression for variety (if available in the model)
        if (VRMExpressionPresetName.Ih) {
          vrm.expressionManager.setValue(
            VRMExpressionPresetName.Ih,
            lipSync.mouthOpenness * 0.3 * Math.sin(time * 1.7)
          );
        }

        // Subtle "Oh" expression for variety (if available in the model)
        if (VRMExpressionPresetName.Ou) {
          vrm.expressionManager.setValue(
            VRMExpressionPresetName.Ou,
            lipSync.mouthOpenness * 0.3 * Math.sin(time * 2.3)
          );
        }
      }

      // Update the blend shapes
      vrm.update(delta);
      positionArms(vrm);
    } else {
      // Gradually close mouth when not speaking for smoother transition
      if (vrmRef.current.expressionManager) {
        const manager = vrmRef.current.expressionManager;
        const currentValue = manager.getValue(VRMExpressionPresetName.Aa) || 0;

        if (currentValue > 0) {
          // Gradual closing of mouth
          const newValue = Math.max(0, currentValue - delta * 2);
          manager.setValue(VRMExpressionPresetName.Aa, newValue);

          // Also reset other expressions if used
          if (VRMExpressionPresetName.Ih) {
            manager.setValue(VRMExpressionPresetName.Ih, 0);
          }
          if (VRMExpressionPresetName.Ou) {
            manager.setValue(VRMExpressionPresetName.Ou, 0);
          }

          vrm.update(delta);
          positionArms(vrm);
        }
      }
    }
  });

  return (
    <>
      {gltf ? (
        <primitive object={gltf.scene} />
      ) : (
        <Html center>{progress} % loaded</Html>
      )}
    </>
  );
};

export default Model;
