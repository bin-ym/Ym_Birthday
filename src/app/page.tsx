"use client";

import { useState, useCallback } from "react";
import BirthdayForm from "@/components/BirthdayForm";
import { BirthdayCelebration } from "@/components/BirthdayCelebration";

export default function Home() {
  const [celebrationData, setCelebrationData] = useState<{
    name: string;
    dateOfBirth: Date;
  } | null>(null);

  const handleSubmit = useCallback((name: string, dateOfBirth: Date) => {
    console.log("Form submitted:", { name, dateOfBirth }); // Debug log
    setCelebrationData({ name, dateOfBirth });
  }, []);

  const handleReset = useCallback(() => {
    console.log("Resetting to form"); // Debug log
    setCelebrationData(null);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      {celebrationData ? (
        <BirthdayCelebration
          name={celebrationData.name}
          dateOfBirth={celebrationData.dateOfBirth}
          onReset={handleReset}
        />
      ) : (
        <BirthdayForm onSubmit={handleSubmit} />
      )}
    </main>
  );
}