"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BirthdayScene from "./BirthdayScene";
import Confetti from "react-confetti";
import { SparklesCore } from "@/components/ui/sparkles"; // Assuming you have a Sparkles component

interface BirthdayCelebrationProps {
  name: string;
  dateOfBirth: Date;
  onReset: () => void;
}

export function BirthdayCelebration({
  name,
  dateOfBirth,
  onReset,
}: BirthdayCelebrationProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Audio autoplay prevented:", err);
      }
    };

    setTimeout(playAudio, 1000);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(avg / 256); // Normalized 0–1
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Stop confetti after some time
    const confettiTimer = setTimeout(() => setShowConfetti(false), 8000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(confettiTimer);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      audioContext.close();
    };
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
      if (!isPlaying && !audio.muted) {
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  const calculateAge = (birthDate: Date) => {
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

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        className="absolute inset-0 z-0"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <BirthdayScene name={name} audioLevel={audioLevel} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
      </Canvas>

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          run={true}
          className="absolute inset-0 z-20"
        />
      )}

      {/* Audio */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/happy-birthday.mp3" type="audio/mpeg" />
      </audio>

      {/* Celebration Card */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
        <Card className="relative max-w-lg w-full bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <SparklesCore>
            <CardHeader className="text-center pt-10">
              <CardTitle className="text-5xl font-black text-white drop-shadow-lg">
                Happy Birthday, {name}!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center pb-10">
              <p className="text-2xl text-white/90 drop-shadow-md">
                🎂 You are {age} years old! 🎂
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={toggleMute}
                  className="bg-white/30 hover:bg-white/40 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all backdrop-blur-sm border border-white/20"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? "Unmute 🔊" : "Mute 🔇"}
                </Button>
                <Button
                  onClick={onReset}
                  className="bg-white/30 hover:bg-white/40 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all backdrop-blur-sm border border-white/20"
                  aria-label="Go back to form"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </SparklesCore>
        </Card>
      </div>
    </div>
  );
}