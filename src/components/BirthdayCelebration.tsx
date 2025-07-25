"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import BirthdayScene from "./BirthdayScene";
import { motion } from "framer-motion";
import Image from "next/image";

interface BirthdayCelebrationProps {
  name: string;
  dateOfBirth: Date;
  onReset: () => void;
}

const icons = [
  { src: "/file.svg", alt: "File Icon" },
  { src: "/globe.svg", alt: "Globe Icon" },
  { src: "/next.svg", alt: "Next.js Icon" },
  { src: "/vercel.svg", alt: "Vercel Icon" },
  { src: "/window.svg", alt: "Window Icon" },
];

export function BirthdayCelebration({
  name,
  dateOfBirth,
  onReset,
}: BirthdayCelebrationProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [takeSnapshot, setTakeSnapshot] = useState(false);
  const [snapshotData, setSnapshotData] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    console.log("BirthdayCelebration rendered with:", { name, dateOfBirth });
  }, [name, dateOfBirth]);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dateOfBirth);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const playAudio = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
          console.log("Audio playback started");
        } catch (error) {
          console.log("Audio autoplay prevented:", error);
        }
      };
      const timeoutId = setTimeout(playAudio, 1000);
      return () => {
        clearTimeout(timeoutId);
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !audioContextRef.current) {
      const audioContext = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 32;
      sourceRef.current = audioContext.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);
    }

    let animationFrameId: number;
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(
          analyserRef.current.frequencyBinCount
        );
        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 128);
      }
      animationFrameId = requestAnimationFrame(updateAudioLevel);
    };

    if (isPlaying) {
      updateAudioLevel();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      if (!isMuted && !isPlaying) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      }
      setIsMuted((prev) => !prev);
    }
  };

  const handleTakeSnapshot = () => {
    setTakeSnapshot(true);
  };

  const handleSnapshotTaken = (dataUrl: string) => {
    setSnapshotData(dataUrl);
    setTakeSnapshot(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 relative overflow-hidden flex flex-col">
      {/* Animated Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {icons.map((icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          >
            <Image src={icon.src} alt={icon.alt} width={50} height={50} />
          </motion.div>
        ))}
      </div>

      {/* Info bar */}
      <motion.div
        className="absolute top-4 left-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl font-semibold text-gray-800">
          {name} is {age} years old!
        </p>
      </motion.div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          onClick={handleTakeSnapshot}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          aria-label="Take a snapshot"
        >
          Take a Snapshot 📸
        </Button>
        <Button
          onClick={toggleMute}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? "Unmute 🔊" : "Mute 🔇"}
        </Button>
        <Button
          onClick={onReset}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          aria-label="Go back to form"
        >
          Back
        </Button>
      </div>

      {/* 3D Scene */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Canvas
          camera={{ position: [0, 2, 7], fov: 50 }}
          className="rounded-xl shadow-xl"
          gl={{ preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <BirthdayScene
            name={name}
            audioLevel={audioLevel}
            takeSnapshot={takeSnapshot}
            onSnapshotTaken={handleSnapshotTaken}
          />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* Snapshot Display */}
      {snapshotData && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSnapshotData(null)}
        >
          <motion.img
            src={snapshotData}
            alt="Birthday Snapshot"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
          />
        </motion.div>
      )}

      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      >
        <source src="/audio/happy-birthday.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
