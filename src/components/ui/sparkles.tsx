"use client";

import { cn } from "@/lib/utils";

interface SparklesProps {
  className?: string;
  particleColor?: string;
  particleCount?: number;
  background?: string;
}

export const SparklesCore = ({
  className,
  particleColor = "#ffffff",
  particleCount = 60,
  background = "transparent",
}: SparklesProps) => {
  const particles = Array.from({ length: particleCount }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
  }));

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      style={{ background }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full"
          style={{
            left: p.left,
            top: p.top,
            backgroundColor: particleColor,
            opacity: 0.8,
            animation: "twinkle 2s infinite ease-in-out",
            animationDelay: p.animationDelay,
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes twinkle {
          0% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};
