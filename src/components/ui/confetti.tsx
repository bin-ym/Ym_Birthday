"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  count?: number;
  colors?: string[];
  duration?: number; // in ms
}

export const Confetti = ({
  count = 100,
  colors = ["#FF69B4", "#FFD700", "#00CED1", "#FF6347", "#9370DB"],
  duration = 5000,
}: ConfettiProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const confettiPieces: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDuration = `${2 + Math.random() * 3}s`;
      confetti.style.animationDelay = `${Math.random() * 1}s`;
      confettiPieces.push(confetti);
      container.appendChild(confetti);
    }

    const timer = setTimeout(() => {
      confettiPieces.forEach((piece) => container.removeChild(piece));
    }, duration);

    return () => {
      clearTimeout(timer);
      confettiPieces.forEach((piece) => container.removeChild(piece));
    };
  }, [count, colors, duration]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden z-50"
    >
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: 0;
          width: 8px;
          height: 12px;
          opacity: 0.8;
          animation: confetti-fall linear forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: rotate(0) translateY(0);
            opacity: 1;
          }
          100% {
            transform: rotate(720deg) translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
