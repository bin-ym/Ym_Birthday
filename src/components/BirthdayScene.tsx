"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Sphere, Box, Plane } from "@react-three/drei";
import * as THREE from "three";

interface BirthdaySceneProps {
  name: string;
  audioLevel?: number;
  takeSnapshot?: boolean;
  onSnapshotTaken?: (dataUrl: string) => void;
}

function Balloon({
  position,
  color,
  audioLevel = 0,
}: {
  position: [number, number, number];
  color: string;
  audioLevel?: number;
}) {
  const balloonRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (balloonRef.current) {
      balloonRef.current.position.y =
        position[1] +
        Math.sin(state.clock.elapsedTime + position[0]) *
          (0.3 + audioLevel * 0.3);
      balloonRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
      balloonRef.current.scale.setScalar(1 + audioLevel * 0.15);
    }
  });

  return (
    <group>
      <Sphere ref={balloonRef} position={position} args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>
      <mesh position={[position[0], position[1] - 1.5, position[2]]}>
        <cylinderGeometry args={[0.01, 0.01, 2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function BirthdayCake({ audioLevel = 0 }: { audioLevel?: number }) {
  const cakeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cakeRef.current) {
      cakeRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      cakeRef.current.scale.setScalar(1 + audioLevel * 0.1);
    }
  });

  return (
    <group ref={cakeRef} position={[0, -0.5, 0]}>
      <Box position={[0, 0, 0]} args={[2.5, 1, 2.5]}>
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </Box>
      <Box position={[0, 0.75, 0]} args={[2, 0.5, 2]}>
        <meshStandardMaterial color="#FFB6C1" roughness={0.5} />
      </Box>
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i}>
          <Box
            position={[i * 0.5 - 1, 1.3, 0]}
            args={[0.08, 0.6, 0.08]}
          >
            <meshStandardMaterial color="#FFFF00" />
          </Box>
          <Sphere
            position={[i * 0.5 - 1, 1.7, 0]}
            args={[0.05, 8, 8]}
          >
            <meshStandardMaterial
              color="#FF4500"
              emissive="#FF4500"
              emissiveIntensity={0.5 + audioLevel * 0.7}
            />
          </Sphere>
        </group>
      ))}
    </group>
  );
}

function FloatingParticles({ audioLevel = 0 }: { audioLevel?: number }) {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      particlesRef.current.children.forEach((child, i) => {
        child.position.y =
          Math.sin(state.clock.elapsedTime + i) * (0.5 + audioLevel * 0.4);
        child.rotation.z = state.clock.elapsedTime + i;
        child.scale.setScalar(1 + audioLevel * 0.2);
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Sphere
          key={i}
          position={[
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 6,
          ]}
          args={[0.1, 8, 8]}
        >
          <meshStandardMaterial
            color={
              ["#FF69B4", "#FFD700", "#00CED1", "#FF6347", "#9370DB"][
                i % 5
              ]
            }
            emissive={
              ["#FF69B4", "#FFD700", "#00CED1", "#FF6347", "#9370DB"][
                i % 5
              ]
            }
            emissiveIntensity={0.3 + audioLevel * 0.3}
            roughness={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
}

function DynamicText({
  text,
  audioLevel = 0,
}: {
  text: string;
  audioLevel?: number;
}) {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 + audioLevel * 0.1);
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 3, 0]}
      fontSize={1.2}
      color="#FF4500"
      anchorX="center"
      anchorY="middle"
      rotation-y={Math.PI * 0.1}
    >
      {text}
    </Text>
  );
}

function PhotoBooth({
  takeSnapshot,
  onSnapshotTaken,
}: {
  takeSnapshot?: boolean;
  onSnapshotTaken?: (dataUrl: string) => void;
}) {
  const { gl, scene, camera } = useThree();
  const [snapshot, setSnapshot] = useState<string | null>(null);

  useEffect(() => {
    if (takeSnapshot) {
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");
      setSnapshot(dataUrl);
      onSnapshotTaken?.(dataUrl);
    }
  }, [takeSnapshot, gl, scene, camera, onSnapshotTaken]);

  return snapshot ? (
    <Plane args={[4, 3]} position={[0, 1.5, 2]}>
      <meshStandardMaterial map={new THREE.TextureLoader().load(snapshot)} />
    </Plane>
  ) : null;
}

function GiftBox() {
  const boxRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (boxRef.current && lidRef.current) {
      const t = (1 + Math.sin(state.clock.elapsedTime * 0.5)) / 2;
      lidRef.current.position.y = 0.5 + t * 0.5;
      lidRef.current.rotation.x = -t * Math.PI * 0.3;
    }
  });

  return (
    <group ref={boxRef} position={[2.5, -0.5, 2]}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color="#FFD700" />
      </Box>
      <Box ref={lidRef} args={[1.1, 0.2, 1.1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#FF6347" />
      </Box>
    </group>
  );
}

export default function BirthdayScene({
  name,
  audioLevel = 0,
  takeSnapshot = false,
  onSnapshotTaken,
}: BirthdaySceneProps) {
  return (
    <group position={[0, -1, 0]}>
      <DynamicText text={`Happy Birthday, ${name}!`} audioLevel={audioLevel} />
      
      <Balloon position={[-1.5, 2.2, -1]} color="#FF69B4" audioLevel={audioLevel} />
      <Balloon position={[-0.8, 2.4, 0]} color="#FFD700" audioLevel={audioLevel} />
      <Balloon position={[0.8, 2.4, 0]} color="#00CED1" audioLevel={audioLevel} />
      <Balloon position={[1.5, 2.2, -1]} color="#FF6347" audioLevel={audioLevel} />
      <Balloon position={[0, 3.2, -1]} color="#9370DB" audioLevel={audioLevel} />

      <BirthdayCake audioLevel={audioLevel} />
      <FloatingParticles audioLevel={audioLevel} />
      <GiftBox audioLevel={audioLevel} />
      <PhotoBooth takeSnapshot={takeSnapshot} onSnapshotTaken={onSnapshotTaken} />
    </group>
  );
}
