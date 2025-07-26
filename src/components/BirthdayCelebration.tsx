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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 relative overflow-hidden flex flex-col p-4 sm:p-6 md:p-8">
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
        className="w-full text-center sm:text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg sm:text-xl font-semibold text-gray-800">
          {name} is {age} years old!
        </p>
      </motion.div>

      {/* 3D Scene */}
      <div className="flex-1 flex items-center justify-center my-4">
        <div className="w-full h-full max-w-4xl max-h-[70vh]">
          <Canvas
            camera={{ position: [0, 2, 9], fov: 50 }}
            className="rounded-xl shadow-xl"
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <BirthdayScene
              name={name}
              audioLevel={audioLevel}
            />
            <OrbitControls enableZoom={true} />
          </Canvas>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-2">
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